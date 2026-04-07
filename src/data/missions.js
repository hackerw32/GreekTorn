// Missions refresh daily. Player can have up to 3 active missions.
export const missionTemplates = [
  // Combat missions
  { id: 'kill_easy_3',     type: 'combat', title: 'Εκκαθάριση Δρόμων',       description: 'Νίκησε 3 εύκολους αντιπάλους', icon: '🤡', target: 3, difficulty: 'easy',      rewardCash: 300,   rewardXP: 30 },
  { id: 'kill_easy_5',     type: 'combat', title: 'Καθαρισμός Γειτονιάς',    description: 'Νίκησε 5 εύκολους αντιπάλους', icon: '🧹', target: 5, difficulty: 'easy',      rewardCash: 600,   rewardXP: 60 },
  { id: 'kill_medium_3',   type: 'combat', title: 'Κυνήγι Κλεφτών',          description: 'Νίκησε 3 μέτριους αντιπάλους', icon: '🗡️', target: 3, difficulty: 'medium',    rewardCash: 800,   rewardXP: 80 },
  { id: 'kill_hard_2',     type: 'combat', title: 'Αντιμετώπιση Νταήδων',    description: 'Νίκησε 2 δύσκολους αντιπάλους', icon: '👊', target: 2, difficulty: 'hard',      rewardCash: 1500,  rewardXP: 120 },
  { id: 'kill_vhard_1',    type: 'combat', title: 'Εξόντωση Μαφιόζου',       description: 'Νίκησε 1 πολύ δύσκολο αντίπαλο', icon: '🤵', target: 1, difficulty: 'very_hard', rewardCash: 2500,  rewardXP: 200 },
  { id: 'kill_any_5',      type: 'combat_any', title: 'Μαχητής της Ημέρας',  description: 'Κέρδισε 5 μάχες (οποιεσδήποτε)', icon: '⚔️', target: 5, rewardCash: 1000,  rewardXP: 100 },
  { id: 'pvp_win_2',       type: 'pvp',    title: 'Κυνηγός Παικτών',         description: 'Κέρδισε 2 PVP μάχες', icon: '🆚', target: 2, rewardCash: 1500,  rewardXP: 150 },

  // Crime missions
  { id: 'crimes_3',        type: 'crime',  title: 'Μικροεγκληματίας',        description: 'Κάνε 3 εγκλήματα', icon: '🎭', target: 3, rewardCash: 500,   rewardXP: 50 },
  { id: 'crimes_5',        type: 'crime',  title: 'Εγκληματική Δραστηριότητα', description: 'Κάνε 5 εγκλήματα', icon: '🔪', target: 5, rewardCash: 1000,  rewardXP: 100 },
  { id: 'crimes_success_3', type: 'crime_success', title: 'Τέλειο Έγκλημα',  description: 'Πέτυχε 3 εγκλήματα στη σειρά', icon: '🎯', target: 3, rewardCash: 1200,  rewardXP: 80 },

  // Training missions
  { id: 'gym_3',           type: 'gym',    title: 'Προπόνηση',               description: 'Κάνε 3 προπονήσεις', icon: '💪', target: 3, rewardCash: 400,   rewardXP: 60 },
  { id: 'gym_5',           type: 'gym',    title: 'Σκληρή Δουλειά',         description: 'Κάνε 5 προπονήσεις', icon: '🏋️', target: 5, rewardCash: 800,   rewardXP: 100 },

  // Mixed missions
  { id: 'earn_2000',       type: 'earn',   title: 'Κυνηγός Χρημάτων',       description: 'Κέρδισε €2.000 σήμερα', icon: '💵', target: 2000, rewardCash: 500,   rewardXP: 50 },
  { id: 'earn_5000',       type: 'earn',   title: 'Μεγάλο Κέρδος',          description: 'Κέρδισε €5.000 σήμερα', icon: '💰', target: 5000, rewardCash: 1000,  rewardXP: 100 },
]

export function getRandomMissions(count = 3) {
  const shuffled = [...missionTemplates].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}
