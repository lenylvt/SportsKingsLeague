export interface Tournament {
  name: string;
  slug: string;
  primaryColorHex: string;
  secondaryColorHex: string;
  category: {
    name: string;
    slug: string;
    sport: {
      name: string;
      slug: string;
      id: number;
    };
    id: number;
    flag: string;
    alpha2?: string;
  };
  userCount: number;
  id: number;
  displayInverseHomeAwayTeams: boolean;
  year?: string;
  splits?: TournamentSplit[];
}

export interface TournamentSplit {
  id: number;
  name: string;
  year: string;
}

export const tournaments: Tournament[] = [
  {
    "name": "Espagne",
    "slug": "spain",
    "primaryColorHex": "#FFC107",
    "secondaryColorHex": "#FFD54F",
    "category": {
      "name": "Spain",
      "slug": "spain",
      "sport": {
        "name": "Football",
        "slug": "football",
        "id": 1
      },
      "id": 32,
      "flag": "spain",
      "alpha2": "ES"
    },
    "userCount": 250000,
    "id": 1,
    "displayInverseHomeAwayTeams": false,
    "year": "2023-2024",
    "splits": [
      { id: 1, name: "Kings Cup", year: "2023-2024" },
      { id: 3, name: "Split 1", year: "2023-2024" },
      { id: 5, name: "Split 2", year: "2023-2024" },
      { id: 8, name: "Kingdom Cup", year: "2023-2024" },
      { id: 10, name: "Split 3", year: "2023-2024" },
      { id: 15, name: "Split 4", year: "2024-2025" },
      { id: 29, name: "Split 5", year: "2024-2025" }
    ]
  },
  {
    "name": "Italie",
    "slug": "italy",
    "primaryColorHex": "#FFC107",
    "secondaryColorHex": "#FFD54F",
    "category": {
      "name": "Italy",
      "slug": "italy",
      "sport": {
        "name": "Football",
        "slug": "football",
        "id": 1
      },
      "id": 31,
      "flag": "italy",
      "alpha2": "IT"
    },
    "userCount": 120000,
    "id": 26,
    "displayInverseHomeAwayTeams": false,
    "year": "2024-2025",
    "splits": [
      { id: 26, name: "Split 1", year: "2024-2025" }
    ]
  },
  {
    "name": "France",
    "slug": "france",
    "primaryColorHex": "#FFC107",
    "secondaryColorHex": "#FFD54F",
    "category": {
      "name": "France",
      "slug": "france",
      "sport": {
        "name": "Football",
        "slug": "football",
        "id": 1
      },
      "id": 7,
      "flag": "france",
      "alpha2": "FR"
    },
    "userCount": 210000,
    "id": 35,
    "displayInverseHomeAwayTeams": false,
    "year": "2024-2025",
    "splits": [
      { id: 35, name: "Split 1", year: "2024-2025" }
    ]
  },
  {
    "name": "Allemagne",
    "slug": "germany",
    "primaryColorHex": "#FFC107",
    "secondaryColorHex": "#FFD54F",
    "category": {
      "name": "Germany",
      "slug": "germany",
      "sport": {
        "name": "Football",
        "slug": "football",
        "id": 1
      },
      "id": 30,
      "flag": "germany",
      "alpha2": "DE"
    },
    "userCount": 180000,
    "id": 36,
    "displayInverseHomeAwayTeams": false,
    "year": "2024-2025",
    "splits": [
      { id: 36, name: "Split 1", year: "2024-2025" }
    ]
  },
  {
    "name": "Amériques",
    "slug": "americas",
    "primaryColorHex": "#FFC107",
    "secondaryColorHex": "#FFD54F",
    "category": {
      "name": "Americas",
      "slug": "americas",
      "sport": {
        "name": "Football",
        "slug": "football",
        "id": 1
      },
      "id": 1470,
      "flag": "international",
      "alpha2": "AM"
    },
    "userCount": 230000,
    "id": 7,
    "displayInverseHomeAwayTeams": false,
    "year": "2023-2024",
    "splits": [
      { id: 7, name: "Split 1", year: "2023-2024" },
      { id: 17, name: "Split 2", year: "2024-2025" },
      { id: 31, name: "Split 3", year: "2024-2025" }
    ]
  },
  {
    "name": "Brésil",
    "slug": "brazil",
    "primaryColorHex": "#FFC107",
    "secondaryColorHex": "#FFD54F",
    "category": {
      "name": "Brazil",
      "slug": "brazil",
      "sport": {
        "name": "Football",
        "slug": "football",
        "id": 1
      },
      "id": 33,
      "flag": "brazil",
      "alpha2": "BR"
    },
    "userCount": 100000,
    "id": 33,
    "displayInverseHomeAwayTeams": false,
    "year": "2024-2025",
    "splits": [
      { id: 33, name: "Split 1", year: "2024-2025" }
    ]
  },
  {
    "name": "Clubs",
    "slug": "clubs",
    "primaryColorHex": "#FFC107",
    "secondaryColorHex": "#FFD54F",
    "category": {
      "name": "Clubs (N)",
      "slug": "clubs",
      "sport": {
        "name": "Football",
        "slug": "football",
        "id": 1
      },
      "id": 1468,
      "flag": "international",
      "alpha2": "CL"
    },
    "userCount": 400000,
    "id": 13,
    "displayInverseHomeAwayTeams": false,
    "year": "2023-2024",
    "splits": [
      { id: 13, name: "Clubs", year: "2023-2024" },
      { id: 37, name: "Clubs 2", year: "2024-2025" }
    ]
  },
  {
    "name": "Nations",
    "slug": "nations",
    "primaryColorHex": "#FFC107",
    "secondaryColorHex": "#FFD54F",
    "category": {
      "name": "Nations (N)",
      "slug": "nations",
      "sport": {
        "name": "Football",
        "slug": "football",
        "id": 1
      },
      "id": 1468,
      "flag": "international",
      "alpha2": "NT"
    },
    "userCount": 450000,
    "id": 28,
    "displayInverseHomeAwayTeams": false,
    "year": "2024-2025",
    "splits": [
      { id: 28, name: "Nations", year: "2024-2025" }
    ]
  }
];