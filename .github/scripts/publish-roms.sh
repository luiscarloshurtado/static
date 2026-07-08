#!/usr/bin/env bash

set -eo pipefail

# Validar variables requeridas
: "${BEFORE:?La variable BEFORE no está definida}"
: "${AFTER:?La variable AFTER no está definida}"

# Verificar que exista la carpeta de ROMs
if [[ ! -d "roms" ]]; then
    echo "La carpeta 'roms' no existe. No hay nada para publicar."
    exit 0
fi

# Detectar archivos modificados
echo "Modo forzado: procesando todas las ROMs."

CHANGED=$(find roms -type f | sort)

# Salir si no hay cambios
if [[ -z "$CHANGED" ]]; then
    echo "No hay ROMs nuevas."
    exit 0
fi

echo ""
echo "Archivos detectados:"
echo "--------------------"
echo "$CHANGED"

while IFS= read -r FILE
do

    [[ -f "$FILE" ]] || continue
    [[ "$FILE" == roms/* ]] || continue

    SYSTEM=$(cut -d'/' -f2 <<< "$FILE")

    RELEASE="roms-$SYSTEM"

    echo ""
    echo "=============================="
    echo "Sistema : $SYSTEM"
    echo "Release : $RELEASE"
    echo "Archivo : $FILE"
    echo "=============================="

    if ! gh release view "$RELEASE" >/dev/null 2>&1
    then

        echo "Creando Release '$RELEASE'..."

        gh release create "$RELEASE" \
            --title "ROMs $SYSTEM" \
            --notes "ROMs de $SYSTEM"

    fi

    echo "Subiendo archivo..."

    if gh release upload "$RELEASE" "$FILE" --clobber
    then
        echo "✓ Subido correctamente."
    else
        echo "✗ Error subiendo '$FILE'."
    fi

done <<< "$CHANGED"

echo ""
echo "Proceso finalizado."
