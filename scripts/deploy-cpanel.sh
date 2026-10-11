#!/usr/bin/env bash
# Static cPanel publication. Requires Bash 4+, sha256sum and coreutils only.
set -euo pipefail
umask 077

die() { printf 'ERROR: %s\n' "$*" >&2; exit 1; }
dry_run=0
target=/home/globalis/public_html
backup_root=/home/globalis/backups
while (($#)); do
  case "$1" in
    --dry-run) dry_run=1; shift ;;
    --target|--backup-root)
      (($# >= 2)) || die "Missing value for $1"
      if [[ "$1" == --target ]]; then target=$2; else backup_root=$2; fi
      shift 2 ;;
    *) die "Unknown argument: $1" ;;
  esac
done

assert_safe_absolute() {
  local value=$1 part current=
  [[ "$value" == /* && "$value" != / && "$value" != */ && "$value" != *//* ]] || die "Unsafe absolute path: $value"
  local -a components
  IFS=/ read -r -a components <<< "${value#/}"
  for part in "${components[@]}"; do
    [[ -n "$part" && "$part" != . && "$part" != .. ]] || die "Unsafe path component: $value"
    current+=/$part
    [[ ! -L "$current" ]] || die "Symlink refused: $current"
    [[ ! -e "$current" || -d "$current" || "$current" == "$value" ]] || die "Non-directory ancestor: $current"
  done
}
script_path=${BASH_SOURCE[0]}
[[ "$script_path" == /* ]] || script_path=$PWD/$script_path
assert_safe_absolute "$script_path"
source_root=$(cd -- "$(dirname -- "$script_path")/.." && pwd -P)
assert_safe_absolute "$source_root"
assert_safe_absolute "$target"
assert_safe_absolute "$backup_root"
[[ -d "$target" ]] || die "Target directory must already exist: $target"
[[ "$target/" != "$source_root/"* && "$source_root/" != "$target/"* ]] || die 'Source and public target must not overlap'
[[ "$backup_root/" != "$target/"* && "$backup_root/" != "$source_root/"* ]] || die 'Backups must be outside both public target and source checkout'
[[ ! -e "$backup_root" || -d "$backup_root" ]] || die 'Backup root is not a directory'

whitelist=$source_root/scripts/cpanel-public-files.sha256
assert_safe_absolute "$whitelist"
assert_safe_absolute "$source_root/deployment-manifest.json"
[[ -f "$whitelist" && -f "$source_root/deployment-manifest.json" ]] || die 'Missing deployment manifest or checksum whitelist'
IFS= read -r manifest_line < "$whitelist"
[[ "$manifest_line" =~ ^#[[:space:]]manifest-sha256:[[:space:]]([a-f0-9]{64})$ ]] || die 'Invalid whitelist manifest binding'
manifest_hash=${BASH_REMATCH[1]}
actual=$(sha256sum -- "$source_root/deployment-manifest.json")
[[ "${actual%% *}" == "$manifest_hash" ]] || die 'Deployment manifest changed; regenerate the checked public whitelist'

declare -a asset_files=() other_files=() html_files=() publish_files=()
declare -A seen=()
while IFS= read -r line || [[ -n "$line" ]]; do
  [[ -z "$line" || "$line" == \#* ]] && continue
  [[ "$line" =~ ^([a-f0-9]{64})[[:space:]][[:space:]]([A-Za-z0-9_./-]+)$ ]] || die 'Malformed public checksum record'
  expected=${BASH_REMATCH[1]}
  relative=${BASH_REMATCH[2]}
  [[ "$relative" != /* && "$relative" != *..* && "$relative" != *//* ]] || die "Unsafe public path: $relative"
  [[ ! ${seen[$relative]+present} ]] || die "Duplicate public path: $relative"
  seen[$relative]=1
  case "$relative" in
    assets/index-*.js|assets/index-*.css|.nojekyll|PHOTO-CREDITS.txt|robots.txt|sitemap.xml|social.json|robotics.json|news/latest.json|index.html|404.html) ;;
    portal/index.html|apply/index.html|contact/whatsapp/international/index.html|contact/whatsapp/turkiye/index.html) ;;
    about/index.html|contact/index.html|contact/whatsapp/index.html|countries/index.html|education/*/index.html|education/index.html|insights/index.html|investment/*/index.html|investment/index.html|privacy/index.html|robotics/*/index.html|robotics/index.html|sectors/*/index.html|sectors/index.html|services/index.html|universities/*/index.html) ;;
    *.jpg|*.jpeg|*.png|*.webp|*.svg) [[ "$relative" != */* ]] || die "Unexpected nested image: $relative" ;;
    *) die "Non-public file refused: $relative" ;;
  esac
  assert_safe_absolute "$source_root/$relative"
  assert_safe_absolute "$target/$relative"
  [[ -f "$source_root/$relative" ]] || die "Missing public source: $relative"
  [[ ! -e "$target/$relative" || -f "$target/$relative" ]] || die "Target is not a regular file: $relative"
  actual=$(sha256sum -- "$source_root/$relative")
  [[ "${actual%% *}" == "$expected" ]] || die "Source checksum mismatch: $relative"
  case "$relative" in
    assets/*) asset_files+=("$relative") ;;
    index.html) ;;
    *.html) html_files+=("$relative") ;;
    *) other_files+=("$relative") ;;
  esac
done < "$whitelist"
[[ ${seen[index.html]+present} && ${#asset_files[@]} -gt 0 ]] || die 'Incomplete public whitelist'
publish_files=("${asset_files[@]}" "${other_files[@]}" "${html_files[@]}" index.html)

htaccess=$target/.htaccess
assert_safe_absolute "$htaccess"
[[ ! -e "$htaccess" || -f "$htaccess" ]] || die '.htaccess must be a regular file'
legacy_htaccess_block=$(cat <<'RULES'
# BEGIN GLOBALISTIHDAM MANAGED HTTPS
<IfModule mod_rewrite.c>
RewriteEngine On
RewriteCond %{HTTPS} !=on
RewriteRule ^ https://globalistihdam.com%{REQUEST_URI} [R=301,L,NE]
</IfModule>
DirectoryIndex index.html
Options -Indexes
# END GLOBALISTIHDAM MANAGED HTTPS
RULES
)
asset_pattern=
for relative in "${asset_files[@]}"; do
  [[ "$relative" =~ ^assets/index-[A-Za-z0-9_-]+\.(js|css)$ ]] || die "Unexpected generated asset name: $relative"
  asset_name=${relative#assets/}
  asset_pattern+=${asset_pattern:+|}${asset_name//./\\.}
done
asset_rule_prefix='RewriteRule ^assets/(?!(?:'
asset_rule_suffix=')$)index-[^/]+\.(?:js|css)$ - [F,L]'
make_htaccess_block() {
  printf '%s\n' \
    '# BEGIN GLOBALISTIHDAM MANAGED HTTPS' \
    '<IfModule mod_rewrite.c>' \
    'RewriteEngine On' \
    'RewriteCond %{HTTPS} !=on' \
    'RewriteRule ^ https://globalistihdam.com%{REQUEST_URI} [R=301,L,NE]' \
    '# Only the current manifest generated bundles may be requested.' \
    "$asset_rule_prefix$1$asset_rule_suffix"
  if [[ ${2:-current} == current ]]; then
    printf '%s\n' \
      '# Known application and contact routes must precede legacy hosting rules.' \
      'RewriteCond %{REQUEST_METHOD} ^(?:GET|HEAD)$' \
      'RewriteRule ^apply/?$ https://basvuru.globalistihdam.com/portal [R=302,L,NE]' \
      'RewriteCond %{REQUEST_METHOD} ^(?:GET|HEAD)$' \
      'RewriteRule ^((?:portal|admin|api|auth|callback)(?:/.*)?)$ https://basvuru.globalistihdam.com/$1 [R=302,L,NE]' \
      'RewriteRule ^(?:portal|apply|admin|api|auth|callback)(?:/|$) - [F,L]' \
      'RewriteRule ^contact/whatsapp/(?:international|turkiye)/?$ https://wa.me/905339247519 [R=302,L,NE]'
  fi
  printf '%s\n' \
    '</IfModule>' \
    'DirectoryIndex index.html' \
    'Options -Indexes' \
    '# END GLOBALISTIHDAM MANAGED HTTPS'
}
htaccess_block=$(make_htaccess_block "$asset_pattern")
manage_htaccess=1
managed_line_count=0
if [[ -f "$htaccess" ]]; then
  mapfile -t htaccess_lines < "$htaccess"
  existing_block=
  if [[ ${htaccess_lines[0]-} == '# BEGIN GLOBALISTIHDAM MANAGED HTTPS' ]]; then
    for line in "${htaccess_lines[@]}"; do
      existing_block+=${existing_block:+$'\n'}$line
      ((managed_line_count+=1))
      [[ "$line" != '# END GLOBALISTIHDAM MANAGED HTTPS' ]] || break
      ((managed_line_count <= 18)) || die 'Existing managed HTTPS block differs; inspect it before deployment'
    done
    if [[ "$existing_block" != "$legacy_htaccess_block" ]]; then
      existing_rule=${htaccess_lines[6]-}
      [[ "$existing_rule" == "$asset_rule_prefix"*"$asset_rule_suffix" ]] || die 'Existing managed HTTPS block differs; inspect it before deployment'
      previous_pattern=${existing_rule#"$asset_rule_prefix"}
      previous_pattern=${previous_pattern%"$asset_rule_suffix"}
      IFS='|' read -r -a previous_assets <<< "$previous_pattern"
      [[ ${#previous_assets[@]} -gt 0 && "$previous_pattern" != '|'* && "$previous_pattern" != *'|' ]] || die 'Invalid existing generated-asset policy'
      for escaped_asset in "${previous_assets[@]}"; do
        previous_asset=${escaped_asset//\\./.}
        [[ "$previous_asset" =~ ^index-[A-Za-z0-9_-]+\.(js|css)$ && "$escaped_asset" == "${previous_asset//./\\.}" ]] || die 'Invalid existing generated-asset policy'
      done
      [[ "$existing_block" == "$(make_htaccess_block "$previous_pattern")" || "$existing_block" == "$(make_htaccess_block "$previous_pattern" bundle-only)" ]] || die 'Existing managed HTTPS block differs; inspect it before deployment'
    fi
    [[ "$existing_block" != "$htaccess_block" ]] || manage_htaccess=0
  fi
  for ((line_index=managed_line_count; line_index<${#htaccess_lines[@]}; line_index++)); do
    [[ ${htaccess_lines[line_index]} != *'GLOBALISTIHDAM MANAGED HTTPS'* ]] || die 'Unexpected additional managed HTTPS marker; inspect it before deployment'
  done
fi

printf 'Verified %s public files against the checked deployment manifest.\n' "${#publish_files[@]}"
if ((dry_run)); then
  printf 'DRY RUN: target %s; private backup root %s\n' "$target" "$backup_root"
  for relative in "${asset_files[@]}" "${other_files[@]}"; do printf 'DEPLOY %s\n' "$relative"; done
  if ((manage_htaccess)); then printf 'UPDATE managed HTTPS, application routes and current-bundle access policy; retain unrelated .htaccess bytes\n'; fi
  printf 'DENY obsolete generated assets/index-*.js and assets/index-*.css; retain files and unrelated assets\n'
  printf 'ROUTE application GET/HEAD requests to the company application domain; deny application writes; route WhatsApp to the company line\n'
  for relative in "${html_files[@]}" index.html; do printf 'DEPLOY %s\n' "$relative"; done
  exit 0
fi

mkdir -p -- "$backup_root"
chmod 700 -- "$backup_root"
lock=$backup_root/.globalistihdam-deploy.lock
mkdir -- "$lock" 2>/dev/null || die 'Another deployment holds the private backup lock'
active_temp=
cleanup() {
  if [[ -n "$active_temp" && -f "$active_temp" ]]; then rm -f -- "$active_temp"; fi
  rmdir -- "$lock" 2>/dev/null || true
}
trap cleanup EXIT
backup=$(mktemp -d "$backup_root/globalistihdam-$(date -u +%Y%m%dT%H%M%SZ)-XXXXXX")
mkdir -- "$backup/files"
printf 'Private backup: %s\n' "$backup"
for relative in "${publish_files[@]}" .htaccess; do
  assert_safe_absolute "$target/$relative"
  if [[ -f "$target/$relative" ]]; then
    mkdir -p -- "$backup/files/$(dirname -- "$relative")"
    cp -p -- "$target/$relative" "$backup/files/$relative"
    printf '%s\n' "$relative" >> "$backup/overwritten-files.txt"
  else
    printf '%s\n' "$relative" >> "$backup/new-files.txt"
  fi
done
cp -- "$source_root/deployment-manifest.json" "$backup/deployment-manifest.json"
cp -- "$whitelist" "$backup/public-files.sha256"

publish() {
  local relative=$1 directory component current=$target
  local -a directory_components
  assert_safe_absolute "$target/$relative"
  directory=$(dirname -- "$target/$relative")
  if [[ "$directory" != "$target" ]]; then
    IFS=/ read -r -a directory_components <<< "${directory#"$target/"}"
    for component in "${directory_components[@]}"; do
      current+=/$component
      if [[ ! -d "$current" ]]; then mkdir -m 755 -- "$current"; fi
    done
  fi
  active_temp=$(mktemp "$directory/.globalistihdam-deploy.XXXXXX")
  cp -- "$source_root/$relative" "$active_temp"
  chmod 644 -- "$active_temp"
  mv -f -- "$active_temp" "$target/$relative"
  active_temp=
  printf 'DEPLOY %s\n' "$relative"
}
for relative in "${asset_files[@]}" "${other_files[@]}"; do publish "$relative"; done
if ((manage_htaccess)); then
  assert_safe_absolute "$htaccess"
  active_temp=$(mktemp "$target/.globalistihdam-deploy.XXXXXX")
  printf '%s\n' "$htaccess_block" > "$active_temp"
  if ((managed_line_count)); then
    tail -n +$((managed_line_count+1)) -- "$htaccess" >> "$active_temp"
  else
    printf '\n' >> "$active_temp"
    if [[ -f "$htaccess" ]]; then cat -- "$htaccess" >> "$active_temp"; fi
  fi
  chmod 644 -- "$active_temp"
  mv -f -- "$active_temp" "$htaccess"
  active_temp=
  printf 'UPDATED .htaccess; original retained in private backup\n'
fi
for relative in "${html_files[@]}" index.html; do publish "$relative"; done
printf 'Deployment complete; unrelated files were retained.\n'
