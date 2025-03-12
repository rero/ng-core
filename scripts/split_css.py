#!/usr/bin/env python
import re
import sys
import os

def split_css_by_layer(css_content, out_dir):

    layers = {}
    layer_stack = []
    current_layer = None
    buffer = []
    others = []
    i = 0

    while i < len(css_content):
        # Détecter un début de layer
        match = re.match(r"@layer\s+([\w-]+)\s*{", css_content[i:])
        if match:
            if current_layer is not None:
                print(f"⚠️ Erreur : Layer {current_layer} mal imbriqué !")
                return

            current_layer = match.group(1)
            layer_stack.append("{")  # On ajoute une accolade d'ouverture
            buffer.append(match.group(0))  # Ajouter le @layer trouvé
            i += match.end()
            continue
        # Gérer l'ouverture d'une accolade
        if css_content[i] == "{":
            layer_stack.append("{")

        # Gérer la fermeture d'une accolade
        if css_content[i] == "}":
            layer_stack.pop()

            if not layer_stack:  # Si on est revenu à 0, on ferme le layer
                buffer.append("}")  # Ajouter l'accolade fermante
                if current_layer:
                  layers[current_layer] = "".join(buffer)
                else:
                  others.append(css_content[i])
                buffer = []
                current_layer = None
                i += 1
                continue

        # Ajouter le caractère courant au buffer
        if current_layer:
            buffer.append(css_content[i])
        else:
          others.append(css_content[i])

        i += 1

    # Vérifier si des layers n'ont pas été fermés correctement
    if current_layer is not None:
        print(f"❌ Erreur : Le layer {current_layer} n'a pas été fermé correctement.")
    if others:
      layers['others'] = "".join(others)
    # Écriture des fichiers sans accolade en trop
    for layer_name, content in layers.items():
        with open(os.path.join(out_dir, f"{layer_name}.scss"), "w", encoding="utf-8") as f:
            f.write(content.strip())  # Supprime les espaces ou retours de ligne en trop
        print(f"✅ Fichier généré : {layer_name}.scss")

out_dir = sys.argv[1]
css_content = sys.stdin.read()
# Exécuter avec un fichier CSS
split_css_by_layer(css_content, out_dir)

