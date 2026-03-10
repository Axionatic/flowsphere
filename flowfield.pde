// licensed under Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)
// https://creativecommons.org/licenses/by-sa/4.0/

// Owns the 3D sector grid and provides sector lookup and random active-sector selection.
class FlowField {
  private Sector[][][] sectors;
  private ArrayList<Sector> activeSectors;
  private int sectorCount;
  private float radius;

  FlowField(float radius) {
    this.radius = radius;

    sectorCount = int((radius * 2) / SECTOR_RES) + (FIELD_PADDING * 2);
    int sectorDim = sectorCount + 1; // loop is inclusive on both ends: 0..sectorCount
    sectors = new Sector[sectorDim][sectorDim][sectorDim];
    activeSectors = new ArrayList<Sector>();
    float radSectors = sectorCount / 2.0;

    int i = 0;
    for (float x = -radSectors; x <= radSectors; x++) {
      int j = 0;
      float secX = x * SECTOR_RES;
      for (float y = -radSectors; y <= radSectors; y++) {
        int k = 0;
        float secY = y * SECTOR_RES;
        for (float z = -radSectors; z <= radSectors; z++) {
          float secZ = z * SECTOR_RES;
          boolean active = sq(secX) + sq(secY) + sq(secZ) <= sq(radius);
          Sector sector = new Sector(i, j, k, secX, secY, secZ, active);
          sectors[i][j][k] = sector;
          if (active) {
            activeSectors.add(sector);
          }
          k++;
        }
        j++;
      }
      i++;
    }
  }

  void update() {
    for (Sector sector : activeSectors) {
      sector.update();
    }
  }

  void displayDebug() {
    for (Sector sector : activeSectors) {
      sector.display();
    }
  }

  Sector getSectorAt(int x, int y, int z) {
    return sectors[x][y][z];
  }

  Sector getRandomActiveSector() {
    if (PARTICLE_RANDOM_SPAWN && activeSectors.size() > 0) {
      return activeSectors.get(int(random(activeSectors.size())));
    }
    int centre = (sectorCount + 1) / 2;
    return sectors[centre][centre][centre];
  }

  int getSectorCount() {
    return sectorCount;
  }

  float getRadius() {
    return radius;
  }
}
