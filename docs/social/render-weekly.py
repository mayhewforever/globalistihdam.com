#!/usr/bin/env python3
"""JSON-driven entry point for the shared 28-second weekly video renderer."""
from pathlib import Path
import argparse, subprocess, sys
parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('input',type=Path,help='weekly-video JSON')
parser.add_argument('--output',type=Path,help='Destination MP4')
parser.add_argument('--validate-only',action='store_true')
args=parser.parse_args()
command=[sys.executable,str(Path(__file__).with_name('render-introduction.py')),'--input',str(args.input)]
if args.validate_only: command.append('--validate-only')
elif args.output: command += ['--output',str(args.output)]
else: parser.error('--output is required when rendering')
raise SystemExit(subprocess.call(command))
