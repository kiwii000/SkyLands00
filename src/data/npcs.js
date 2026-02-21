export const NPCS = [
  {
    id: 'nova',
    name: 'Nova',
    color: 0xffb347,
    schedule: [
      { start: 360, end: 660, map: 'hub', x: 120, y: 130, behavior: 'station', dialogue: 'Morning calibrations at the command deck.' },
      { start: 660, end: 960, map: 'farm', x: 180, y: 160, behavior: 'patrol', dialogue: 'Hydroponics are thriving today.' },
      { start: 960, end: 1320, map: 'ship', x: 110, y: 120, behavior: 'idle', dialogue: 'I log reports before lights-out.' }
    ]
  },
  {
    id: 'byte',
    name: 'Byte',
    color: 0x8aff8a,
    schedule: [
      { start: 360, end: 840, map: 'hub', x: 290, y: 120, behavior: 'station', dialogue: 'Supply kiosks open right on schedule.' },
      { start: 840, end: 1140, map: 'mine', x: 160, y: 130, behavior: 'patrol', dialogue: 'Mine drones behave if you keep moving.' },
      { start: 1140, end: 1320, map: 'hub', x: 290, y: 120, behavior: 'station', dialogue: 'Closing the kiosk soon.' }
    ]
  },
  {
    id: 'zen',
    name: 'Zen',
    color: 0xb699ff,
    schedule: [
      { start: 360, end: 720, map: 'farm', x: 240, y: 180, behavior: 'idle', dialogue: 'The plants prefer soft station lighting.' },
      { start: 720, end: 1080, map: 'hub', x: 410, y: 180, behavior: 'station', dialogue: 'Need med-gel or tea? I have both.' },
      { start: 1080, end: 1320, map: 'ship', x: 170, y: 120, behavior: 'idle', dialogue: 'Rest keeps your reactor-heart steady.' }
    ]
  }
];
