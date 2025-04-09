import store from '../store';

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
export const athleteGendersList = () => Object.keys(athleteGenders).map((gender) => athleteGenders[gender][`${store.getters['localization/lang']}_name`]);

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
export const getAthleteGroups = (gender) => {
  const appLang = store.getters['localization/lang'];
  const genderEntry = Object.entries(athleteGenders).find(([key, value]) => value[`${appLang}_name`] === gender);
  const genderKey = genderEntry ? genderEntry[0] : null;

  if (!genderKey) {
    const noGroup = {
      EN_name: 'Без Группы',
      RU_name: 'No Group',
    };
    return [noGroup[`${appLang}_name`]];
  }

  return athleteGroups[genderKey].map((group) => group[`${appLang}_name`]);
};
