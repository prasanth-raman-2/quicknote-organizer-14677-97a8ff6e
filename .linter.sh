#!/bin/bash
cd /home/kavia/workspace/code-generation/quicknote-organizer-14677-97a8ff6e/quicknote_organizer
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

