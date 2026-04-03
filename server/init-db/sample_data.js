export const rooms = [
  {
    _id: "660000000000000000000001",
    name: "Room A",
    last_reading: 1240
  },
  {
    _id: "660000000000000000000002",
    name: "Room B",
    last_reading: 980
  },
  {
    _id: "660000000000000000000003",
    name: "Room C",
    last_reading: 1560
  }
];
export const readings = [
  {
    room: "660000000000000000000001",
    previous: 1100,
    current: 1240,
    units: 140,
    date: new Date("2026-03-01")
  },
  {
    room: "660000000000000000000002",
    previous: 850,
    current: 980,
    units: 130,
    date: new Date("2026-03-01")
  },
  {
    room: "660000000000000000000003",
    previous: 1300,
    current: 1560,
    units: 260,
    date: new Date("2026-03-01")
  }
];
export const bills = [
  {
    totalUnits: 530,
    totalAmount: 3180,
    extraUnits: 30,
    splitType: "equal",

    rooms: [
      {
        room: "660000000000000000000001",
        units: 140,
        extraUnits: 10,
        finalUnits: 150,
        amount: 900
      },
      {
        room: "660000000000000000000002",
        units: 130,
        extraUnits: 10,
        finalUnits: 140,
        amount: 840
      },
      {
        room: "660000000000000000000003",
        units: 260,
        extraUnits: 10,
        finalUnits: 270,
        amount: 1620
      }
    ]
  }
];