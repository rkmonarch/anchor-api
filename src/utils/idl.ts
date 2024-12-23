export type Favorites = {
  version: "0.1.0";
  name: "favorites";
  instructions: [
    {
      name: "setFavorites";
      accounts: [
        { name: "user"; isMut: true; isSigner: true },
        { name: "favorites"; isMut: true; isSigner: false },
        { name: "systemProgram"; isMut: false; isSigner: false }
      ];
      args: [
        { name: "number"; type: "u64" },
        { name: "color"; type: "string" },
        { name: "hobbies"; type: { vec: "string" } }
      ];
    }
  ];
  accounts: [
    {
      name: "Favorites";
      type: {
        kind: "struct";
        fields: [
          { name: "number"; type: "u64" },
          { name: "color"; type: "string" },
          { name: "hobbies"; type: { vec: "string" } }
        ];
      };
    }
  ];
};

export const IDL: Favorites = {
  version: "0.1.0",
  name: "favorites",
  instructions: [
    {
      name: "setFavorites",
      accounts: [
        { name: "user", isMut: true, isSigner: true },
        { name: "favorites", isMut: true, isSigner: false },
        { name: "systemProgram", isMut: false, isSigner: false },
      ],
      args: [
        { name: "number", type: "u64" },
        { name: "color", type: "string" },
        { name: "hobbies", type: { vec: "string" } },
      ],
    },
  ],
  accounts: [
    {
      name: "Favorites",
      type: {
        kind: "struct",
        fields: [
          { name: "number", type: "u64" },
          { name: "color", type: "string" },
          { name: "hobbies", type: { vec: "string" } },
        ],
      },
    },
  ],
};
