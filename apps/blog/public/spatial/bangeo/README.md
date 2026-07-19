# BANGEO Spatial Fabric

This folder contains the first BANGEO Spatial Fabric created for Artemis v0.3.0 and the Sneeze engine.

## Files

- `bangeo.json`: unsigned source fabric for development and testing
- `bangeo-test.msf`: JWS-signed test build created with the public OMBI test certificate
- `wasm/map.wasm`: stock Sneeze map module copied from the official examples
- `assets/bangeo-spatial-guide-v3.glb`: self-contained BANGEO scene asset

## Public URLs

- `https://www.bangeo.net/spatial/bangeo/bangeo.json`
- `https://www.bangeo.net/spatial/bangeo/bangeo-test.msf`

The `.msf` file uses the public `Test Provider` certificate from the Sneeze repository. It is for format and loading tests only and does not establish BANGEO's production publishing identity.

The Blender source generator is available at `apps/blog/scripts/create-bangeo-spatial-asset.py`.
