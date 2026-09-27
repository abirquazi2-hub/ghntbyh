// Rebuilds assets/models/car-concept.glb from the original Khronos "Car Concept" sample (CC BY 4.0).
//
// The CC BY licence excludes the Khronos and 3D Commerce logos, so they are removed:
//   texture 3  – Khronos logo (licence plate + emissive trim)  -> plain black
//   texture 10 – tyre sidewall colour with logos               -> plain tyre grey
//   texture 11 – tyre sidewall normal map with embossed logos  -> flat normal
//   "License Plate" mesh                                        -> deleted
//
// Usage:
//   curl -L -o CarConcept.glb https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/CarConcept/glTF-Binary/CarConcept.glb
//   npx -y @gltf-transform/cli@4 --version   # make sure the CLI is available
//   node scripts/clean-model.mjs CarConcept.glb car-clean.glb
//   npx @gltf-transform/cli@4 optimize car-clean.glb assets/models/car-concept.glb \
//     --compress meshopt --texture-compress webp --texture-size 1024 \
//     --simplify false --join false --flatten false --instance false --palette false
// Afterwards, view the model and check that no logos remain.
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';

const [input = 'CarConcept.glb', output = 'car-clean.glb'] = process.argv.slice(2);

// 8x8 solid-colour PNGs
const png = b64 => Buffer.from(b64, 'base64');
const REPLACE = {
  3: png('iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAIAAABLbSncAAAADElEQVR4nGNgGB4AAADIAAGtQHYiAAAAAElFTkSuQmCC'), // rgb(0,0,0)
  10: png('iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAIAAABLbSncAAAAFElEQVR4nGOUlZVlwAaYsIoOWgkASlIAZ6tZrkwAAAAASUVORK5CYII='), // rgb(29,29,29)
  11: png('iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAIAAABLbSncAAAAFElEQVR4nGNsaPjPgA0wYRUdtBIAkdICD7BrMqkAAAAASUVORK5CYII='), // rgb(128,128,255)
};

const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
const doc = await io.read(input);
const textures = doc.getRoot().listTextures();
for (const [i, data] of Object.entries(REPLACE)) textures[i].setImage(data).setMimeType('image/png');
for (const node of doc.getRoot().listNodes()) if (node.getName() === 'License Plate') node.dispose();
await io.write(output, doc);
console.log(`wrote ${output}`);
