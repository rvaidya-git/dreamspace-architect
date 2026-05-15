export const MISSIONS = [
  // ── 1. Alex's Cozy Bedroom ─────────────────────
  {
    id: 'bedroom-alex',
    client: 'Alex',
    clientEmoji: '🧒',
    title: "Alex's Cozy Bedroom",
    tagline: 'A comfy room for sleeping and studying',
    brief:
      "Hi! I need a cozy bed to sleep in, a desk for homework, and some nice lighting. I love plants — please add one! A window would be amazing too. My budget is $800.",
    budget: 800,
    difficulty: 1,
    color: '#FFE8C8',
    themeEmoji: '🏡',
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

  // ── 2. Nova's Space Bedroom ─────────────────────
  {
    id: 'space-bedroom-nova',
    client: 'Nova',
    clientEmoji: '🧑‍🚀',
    title: "Nova's Space Bedroom",
    tagline: 'Sleep among the stars!',
    brief:
      "Greetings, earthling! I want my bedroom to feel like outer space. I need a bed near the window so I can stargaze, a desk for my space homework, and LOTS of lights — space is very dark! I also need somewhere to store all my space gear.",
    budget: 650,
    difficulty: 2,
    color: '#DDD0FF',
    themeEmoji: '🚀',
    gridCols: 10,
    gridRows: 8,
    goals: [
      {
        id: 'has-bed',
        label: 'Place a bed (for stargazing naps)',
        check: (items) => items.some((i) => i.itemId === 'bed'),
      },
      {
        id: 'has-desk',
        label: 'Place a desk (space homework!)',
        check: (items) => items.some((i) => i.itemId === 'desk'),
      },
      {
        id: 'has-2-lights',
        label: 'Add at least 2 light sources',
        check: (items) =>
          items.filter((i) => ['lamp', 'floor-lamp'].includes(i.itemId)).length >= 2,
      },
      {
        id: 'has-window',
        label: 'Add a window (for stargazing)',
        check: (items) => items.some((i) => i.itemId === 'window'),
      },
      {
        id: 'has-storage',
        label: 'Add storage (for space gear)',
        check: (items) =>
          items.some((i) =>
            ['bookshelf', 'dresser', 'wardrobe', 'nightstand'].includes(i.itemId)
          ),
      },
    ],
  },

  // ── 3. Sam's Reading Nook ───────────────────────
  {
    id: 'reading-nook-sam',
    client: 'Sam',
    clientEmoji: '🤓',
    title: "Sam's Reading Nook",
    tagline: 'The coziest corner for books',
    brief:
      "Hi there! I want the coziest reading nook ever. I need a big bookshelf full of books, something comfy to sit on, a lamp for reading (not too bright!), a plant to keep me company, and a cozy rug to curl up on. Keep it small and snug!",
    budget: 420,
    difficulty: 1,
    color: '#D4EEC8',
    themeEmoji: '📖',
    gridCols: 8,
    gridRows: 6,
    goals: [
      {
        id: 'has-bookshelf',
        label: 'Place a bookshelf',
        check: (items) => items.some((i) => i.itemId === 'bookshelf'),
      },
      {
        id: 'has-seat',
        label: 'Add somewhere comfy to sit',
        check: (items) => items.some((i) => ['sofa', 'chair', 'bean-bag'].includes(i.itemId)),
      },
      {
        id: 'has-lamp',
        label: 'Add a reading lamp',
        check: (items) => items.some((i) => ['lamp', 'floor-lamp'].includes(i.itemId)),
      },
      {
        id: 'has-plant',
        label: 'Add a plant for company',
        check: (items) =>
          items.some((i) => ['small-plant', 'big-plant'].includes(i.itemId)),
      },
      {
        id: 'has-rug',
        label: 'Add a cozy rug',
        check: (items) => items.some((i) => i.itemId === 'rug'),
      },
    ],
  },

  // ── 4. Mia's Art Studio ─────────────────────────
  {
    id: 'art-studio-mia',
    client: 'Mia',
    clientEmoji: '👩‍🎨',
    title: "Mia's Art Studio",
    tagline: 'Create masterpieces here!',
    brief:
      "Hiya! I paint and draw all day long and I need a proper studio. I need a desk to work at, a chair to sit on, lots of natural light from a window, a bookshelf for my art books, and some plants for inspiration. Make it bright and creative!",
    budget: 500,
    difficulty: 2,
    color: '#FFD8C8',
    themeEmoji: '🎨',
    gridCols: 10,
    gridRows: 7,
    goals: [
      {
        id: 'has-desk',
        label: 'Place an art desk',
        check: (items) => items.some((i) => i.itemId === 'desk'),
      },
      {
        id: 'has-chair',
        label: 'Add a chair to sit at',
        check: (items) => items.some((i) => i.itemId === 'chair'),
      },
      {
        id: 'has-window',
        label: 'Add a window (natural light!)',
        check: (items) => items.some((i) => i.itemId === 'window'),
      },
      {
        id: 'has-bookshelf',
        label: 'Place a bookshelf (art books)',
        check: (items) => items.some((i) => i.itemId === 'bookshelf'),
      },
      {
        id: 'has-plant',
        label: 'Add a plant for inspiration',
        check: (items) =>
          items.some((i) => ['small-plant', 'big-plant'].includes(i.itemId)),
      },
    ],
  },

  // ── 5. Jordan's Animal Rescue Room ─────────────
  {
    id: 'animal-room-jordan',
    client: 'Jordan',
    clientEmoji: '🧑',
    title: "Jordan's Animal Room",
    tagline: 'A cozy haven for rescue animals',
    brief:
      "I rescue animals and need a special room just for them! I need a cozy sofa for cuddle time, LOTS of plants because animals love nature, a warm lamp, a soft rug they can play on, and a window for fresh air. The animals deserve the very best!",
    budget: 580,
    difficulty: 2,
    color: '#C8EED4',
    themeEmoji: '🐾',
    gridCols: 12,
    gridRows: 8,
    goals: [
      {
        id: 'has-sofa',
        label: 'Place a sofa (for animal cuddles)',
        check: (items) => items.some((i) => i.itemId === 'sofa'),
      },
      {
        id: 'has-2-plants',
        label: 'Add at least 2 plants',
        check: (items) =>
          items.filter((i) => ['small-plant', 'big-plant'].includes(i.itemId)).length >= 2,
      },
      {
        id: 'has-lamp',
        label: 'Add a warm lamp',
        check: (items) => items.some((i) => ['lamp', 'floor-lamp'].includes(i.itemId)),
      },
      {
        id: 'has-rug',
        label: 'Add a rug (for the animals to play on)',
        check: (items) => items.some((i) => i.itemId === 'rug'),
      },
      {
        id: 'has-window',
        label: 'Add a window (fresh air!)',
        check: (items) => items.some((i) => i.itemId === 'window'),
      },
    ],
  },

  // ── 6. Dr. Penny's Science Lab ──────────────────
  {
    id: 'science-lab-penny',
    client: 'Dr. Penny',
    clientEmoji: '👩‍🔬',
    title: "Dr. Penny's Science Lab",
    tagline: 'Where experiments come to life!',
    brief:
      "Welcome to the future of science! I need TWO big desks for experiments, at least two bright lamps so I can see my work clearly, a bookshelf for my research books, a storage unit for equipment, and a window for ventilation. This lab must be EXCELLENT!",
    budget: 750,
    difficulty: 3,
    color: '#C8E8FF',
    themeEmoji: '🔬',
    gridCols: 12,
    gridRows: 8,
    goals: [
      {
        id: 'has-2-desks',
        label: 'Place at least 2 desks',
        check: (items) => items.filter((i) => i.itemId === 'desk').length >= 2,
      },
      {
        id: 'has-2-lights',
        label: 'Add at least 2 bright lamps',
        check: (items) =>
          items.filter((i) => ['lamp', 'floor-lamp'].includes(i.itemId)).length >= 2,
      },
      {
        id: 'has-bookshelf',
        label: 'Add a research bookshelf',
        check: (items) => items.some((i) => i.itemId === 'bookshelf'),
      },
      {
        id: 'has-storage',
        label: 'Add equipment storage',
        check: (items) =>
          items.some((i) => ['dresser', 'wardrobe', 'nightstand'].includes(i.itemId)),
      },
      {
        id: 'has-window',
        label: 'Add a window (ventilation!)',
        check: (items) => items.some((i) => i.itemId === 'window'),
      },
    ],
  },
];
