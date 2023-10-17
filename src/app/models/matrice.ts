export interface UserMatrice {
  id: String;
  url: String;
  img: String;
  host: String;
  login: String;
  displayName: String;
}

export interface Poste {
  user?: UserMatrice;
  viable: boolean;
  occupe: boolean;
  zone: number;
  ranger: number;
  poste: number;
}

export interface Ranger {
  ranger: number;
  postes: Poste[];
}

export interface Zone {
  zone: number;
  rangers: Ranger[];
}

export class Matrice {
  zones: Zone[] = [];

  constructor(users: UserMatrice[]) {
    // Configuration des zones, rangers et postes selon vos règles
    const zoneConfigs = [
      { rangees: 12, postesPerRangee: [5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5] },
      { rangees: 12, postesPerRangee: [8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 7, 7] },
      { rangees: 13, postesPerRangee: [4, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 3] },
      { rangees: 13, postesPerRangee: [7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 6, 6] },
    ];

    // Initialisation des zones, rangers et postes
    this.zones = zoneConfigs.map((config, zIdx) => {
      const rangers: Ranger[] = Array.from({ length: config.rangees }, (_, rIdx) => {
        const postes: Poste[] = Array.from({ length: config.postesPerRangee[rIdx] }, (_, pIdx) => ({
          user: undefined,
          viable: true,
          occupe: false,
          zone: zIdx + 1,
          ranger: rIdx + 1,
          poste: pIdx + 1,
        }));
        return { ranger: rIdx + 1, postes };
      });
      return { zone: zIdx + 1, rangers };
    });

    // Allocation des utilisateurs aux postes
    this.allocateUsers(users);
  }

  allocateUsers(users: UserMatrice[]): void {
    users.forEach((user) => {
      const match = user.host.match(/z(\d+)r(\d+)p(\d+)/);
      if (!match) {
        console.error(`Invalid host format: ${user.host}`);
        return;
      }
      const [, z, r, p] = match.map(Number);

      // Vérification et allocation de l'utilisateur à un poste
      if (this.zones[z - 1] && this.zones[z - 1].rangers[r - 1] && this.zones[z - 1].rangers[r - 1].postes[p - 1]) {
        const targetPoste = this.zones[z - 1].rangers[r - 1].postes[p - 1];

        if (targetPoste.viable) {
          targetPoste.user = user;
          targetPoste.occupe = true;
        } else {
          console.error(`Trying to allocate user to a non-viable poste: ${user.host}`);
        }
      } else {
        console.error(`Invalid position: ${user.host}`);
      }
    });
  }
}
