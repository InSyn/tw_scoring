import store from '../store';
import { normalizeString } from '../utils/utils';

export const athleteGenders = {
  men: {
    RU_name: 'Мужчины',
    EN_name: 'Men',
  },
  women: {
    RU_name: 'Женщины',
    EN_name: 'Women',
  },
  mixed: {
    RU_name: 'Смешанный',
    EN_name: 'Mixed',
  },
};

export const getAthleteGendersList = () =>
  Object.keys(athleteGenders).map((genderKey) => {
    return athleteGenders[genderKey][`${store.getters['localization/lang']}_name`];
  });

export const getGenderLabelByKey = (genderKey) => {
  if (!genderKey || !athleteGenders[genderKey]) return '';
  const appLang = store.getters['localization/lang'];
  return athleteGenders[genderKey][`${appLang}_name`] || '';
};

const athleteGroups = {
  men: [
    {
      RU_name: 'Мужчины',
      EN_name: 'Men',
      description_ru: 'Взрослые мужчины старше 18 лет',
      description_en: 'Adult males over 18 years old',
    },
    {
      RU_name: 'Юниоры',
      EN_name: 'Junior Men',
      description_ru: 'Мужчины (юниоры) в возрастной категории (обычно 16–18 лет)',
      description_en: 'Male juniors (usually 16–18 years old)',
    },
    {
      RU_name: 'Юноши',
      EN_name: 'Youth Boys',
      description_ru: 'Мальчики в старшем подростковом возрасте (обычно 14–16 лет)',
      description_en: 'Older teenage boys (usually 14–16 years old)',
    },
    {
      RU_name: 'Мальчики',
      EN_name: 'Boys',
      description_ru: 'Младший подростковый возраст (обычно до 14 лет)',
      description_en: 'Younger boys (generally up to 14 years old)',
    },
  ],
  women: [
    {
      RU_name: 'Женщины',
      EN_name: 'Women',
      description_ru: 'Взрослые женщины старше 18 лет',
      description_en: 'Adult females over 18 years old',
    },
    {
      RU_name: 'Юниорки',
      EN_name: 'Junior Women',
      description_ru: 'Женщины (юниорки) в возрастной категории (обычно 16–18 лет)',
      description_en: 'Female juniors (usually 16–18 years old)',
    },
    {
      RU_name: 'Девушки',
      EN_name: 'Youth Girls',
      description_ru: 'Девочки в старшем подростковом возрасте (обычно 14–16 лет)',
      description_en: 'Older teenage girls (usually 14–16 years old)',
    },
    {
      RU_name: 'Девочки',
      EN_name: 'Girls',
      description_ru: 'Младший подростковый возраст (обычно до 14 лет)',
      description_en: 'Younger girls (generally up to 14 years old)',
    },
  ],
  mixed: [
    {
      RU_name: 'Смешанный',
      EN_name: 'Mixed',
      description_ru: 'Смешанный',
      description_en: 'Mixed',
    },
  ],
};

// Centralized mapping from localized gender label to canonical gender key
const findGenderKeyByLabel = (genderLabel) => {
  if (!genderLabel) return null;
  const appLang = store.getters['localization/lang'];
  const labelNorm = normalizeString(genderLabel);

  const genderEntry = Object.entries(athleteGenders).find(([, value]) => {
    return normalizeString(value[`${appLang}_name`]) === labelNorm;
  });

  return genderEntry ? genderEntry[0] : null;
};

export const getAthleteGroups = (genderLabel) => {
  const appLang = store.getters['localization/lang'];
  const genderKey = findGenderKeyByLabel(genderLabel);

  if (!genderKey) {
    const noGroup = {
      EN_name: 'Без Группы',
      RU_name: 'No Group',
    };
    return [noGroup[`${appLang}_name`]];
  }

  return athleteGroups[genderKey].map((group) => group[`${appLang}_name`]);
};

// Public helper to convert localized gender label -> canonical key ('men' | 'women' | 'mixed')
export const getAthleteGenderKey = (genderLabel) => findGenderKeyByLabel(genderLabel);

// Synonyms for free-form gender inputs (stage titles, legacy JSON, etc.)
const genderSynonyms = {
  men: ['men', 'man', 'm', 'м', 'муж', 'мужчины'],
  women: ['women', 'woman', 'w', 'f', 'ж', 'жен', 'женщины', 'ladies', 'lady'],
  mixed: ['mixed', 'mix', 'mx', 'см', 'смеш', 'смешанный'],
};

// Given a list of arbitrary text candidates (group label, stage group, etc.),
// infer the best matching localized gender label using athleteGenders + athleteGroups.
export const inferGenderLabelFromCandidates = (candidates) => {
  const appLang = store.getters['localization/lang'];
  const gendersList = getAthleteGendersList();

  const uniqueCandidates = (candidates || [])
    .filter(Boolean)
    .map((c) => c.toString())
    .filter((c, idx, arr) => arr.indexOf(c) === idx);

  for (const candidate of uniqueCandidates) {
    const candNorm = normalizeString(candidate);
    if (!candNorm) continue;

    // 1) Direct match against localized gender labels
    const directIdx = gendersList.findIndex((g) => normalizeString(g) === candNorm);
    if (directIdx !== -1) {
      return gendersList[directIdx];
    }

    // 2) Synonym match mapped to canonical gender keys
    const synonymKey = Object.keys(genderSynonyms).find((key) => genderSynonyms[key].includes(candNorm));
    if (synonymKey && athleteGenders[synonymKey]) {
      return athleteGenders[synonymKey][`${appLang}_name`];
    }

    // 3) Match via athlete groups: see which gender owns this group label
    for (let i = 0; i < gendersList.length; i += 1) {
      const genderLabel = gendersList[i];
      const groupsForGender = getAthleteGroups(genderLabel) || [];
      const normGroups = groupsForGender.map((g) => normalizeString(g));

      const matchesGroup = normGroups.some((g) => g === candNorm || g.includes(candNorm) || candNorm.includes(g));
      if (matchesGroup) {
        return genderLabel;
      }
    }
  }

  return null;
};
