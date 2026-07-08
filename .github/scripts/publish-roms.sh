#!/usr/bin/env bash

set -eo pipefail

if [[ "$BEFORE" == "0000000000000000000000000000000000000000" ]]; then
    echo "Primer push detectado."
    CHANGED=$(find roms -type f)
else
    CHANGED=$(git diff --name-only "$BEFORE" "$AFTER")
fi

if [[ -z "$CHANGED" ]]; then
    echo "No hay ROMs nuevas."
    exit 0
fi

echo "$CHANGED"

while IFS= read -r FILE
do

    [[ -f "$FILE" ]] || continue

    [[ "$FILE" == roms/* ]] || continue

    SYSTEM=$(echo "$FILE" | cut -d'/' -f2)

    RELEASE="roms-$SYSTEM"

    echo ""
    echo "=============================="
    echo "Sistema : $SYSTEM"
    echo "Release : $RELEASE"
    echo "Archivo : $FILE"
    echo "=============================="

    if ! gh release view "$RELEASE" >/dev/null 2>&1
    then

        echo "Creando Release $RELEASE..."

        gh release create "$RELEASE" \
            --title "ROMs $SYSTEM" \
            --notes "ROMs de $SYSTEM"

    fi

    echo "Subiendo..."

    gh release upload "$RELEASE" "$FILE" --clobber || {

        echo "Error subiendo $FILE"

    }

done <<< "$CHANGED"
