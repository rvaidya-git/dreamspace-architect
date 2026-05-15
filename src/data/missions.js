export const MISSIONS = [
  {
    id: 'bedroom-1',
    client: 'Alex',
    clientEmoji: '🧒',
    title: "Alex's Cozy Bedroom",
    brief: "Hi! I need a cozy bed to sleep in, a desk for homework, and some nice lighting. I love plants — please add one! A window would be amazing too. My budget is $800.",
    budget: 800,
    gridCols: 10,
    gridRows: 8,
    goals: [
      {
        id: 'has-bed',
        label: 'Place a bed',
        check: (items) => items.some((i) => i.itemId === 'bed'),
      },
      {
        id: 'has-desk',
        label: 'Place a desk',
        check: (items) => items.some((i) => i.itemId === 'desk'),
      },
      {
        id: 'has-light',
        label: 'Add some lighting',
        check: (items) => items.some((i) => ['lamp', 'floor-lamp'].includes(i.itemId)),
      },
      {
        id: 'has-plant',
        label: 'Add a plant',
        check: (items) => items.some((i) => ['small-plant', 'big-plant'].includes(i.itemId)),
      },
      {
        id: 'has-window',
        label: 'Add a window',
        check: (items) => items.some((i) => i.itemId === 'window'),
      },
    ],
  },
];
