export default {
  namespaced: true,
  state: {
    lang: "RU",
    lang_list: ["RU", "EN"],
    localization: {
      RU: {
        app: {
          menu: {
            competitionSettings: "Событие",
            rulesSetup: "Настройки",
            competitors: "Участники",
            teams: "Команды",
            start_protocols: "Заезды",
            scoring: "Скоринг",
            protocols: "Протоколы",
            jumpCodes: "Таблица прыжков",
          },
          event: {
            event_header: "Событие",
            event_title: "Название события",
            competition_header: "Настройки соревнования",
            forerunners: "Открывающие",
            number_of_competitions: "Количество соревнований",
            main_data: {
              title: "Название",
              discipline: "Дисциплина",
              group: "группа",
              date: "Дата",
              country: "Страна",
              location: "Город",
              provider: "Организация",
              providerTiming: "Скоринг-провайдер",
              codex: "Код",
            },
            weather: "Погода",
          },
          server: {
            start_btn: "Запустить сервер",
            indicator: {
              on: "Вкл",
              off: "Выкл",
            },
          },
          settings: {
            stages: {
              title: "Настройка этапов",
              no_stages: "Нет других этапов",
              passed_number: "Кол-во прошедших",
              stage: "Этап",
              stages_grid: "Сетка этапов",
              reset_btn: "Сбросить",
            },
            precision: {
              result_precision: "Точность результата",
            },
            race_results: {
              title: "Формула подсчёта заезда",
              by_judge: {
                ae: "АЕ",
                average: "Среднее",
                corridor: "Коридор",
                d_up: "Double Up",
                moguls: "Могул",
                r_best: "Убрать лучш.",
                r_last: "Убрать худш.",
                ski_jumps: "Прыжки с трамплина",
                sum: "Сумма",
                title: "По судьям",
              },
              by_section: {
                add_section: "Добавить секцию",
                coefficient: "Коэфф.",
                d_coefficient: "Коэффициент",
                new_section: "Новая секция",
                title: "По секциям",
              },
            },
            overall_results: {
              title: "Формула подсчёта этапа",
              best: "Лучший",
              sum: "Сумма",
              average: "Среднее",
              abc: "ABC",
              b_o_a: "Лучший из всех",
              b_o_n: "Лучший из N",
            },
          },
          competitors: {
            title: "Участники",
            from_prev: "Из предыдущего этапа",
            load_from_file: "Загрузить из файла",
            export_btn: "Экспорт",
            d_competitor_info: "Данные участника",
            d_delete_competitor: "Удалить участника",
            create_competitor: "Создать участника",
            d_new_competitor: "Новый участник",
            sheet_settings: "Настройки таблицы",
            d_add_col: "Добавить столбец",
            clear_table: "Очистить таблицу",
            d_delete_all: "Удалить всех участников?",
          },
          races: {
            title: "Стартовые списки",
            no_races: "Нет созданных заездов",
            no_selected_race: "Не выбран",
            race: "Заезд",
            raceTitle: "Название заезда",
            create_race: "Создать заезд",
            d_title: "Название заезда",
            d_add_all: "Добавить всех",
            d_add_from_race: "Стартовый порядок из",
            d_available: "Доступные участники",
            d_start_order: "Стартовый порядок",
            d_prev_race_order: "Предыдущий заезд",
            d_num_of_competitors: "Количество участников",
            add_competitors: "Добавить участников",
            d_add_competitors_to: "Добавить участников в",
            d_no_marks: "Нет оценок",
            d_clear_results: "Очистить результаты заезда",
            d_remove_from_race: "Удалить из заезда",
            range_by_res: "Сортировать по рез-м",
            turn_over: "Перевернуть",
            shuffle: "Перемешать",
            export_race: "Экспорт",
            clear_res: "Очистить результаты",
          },
          scoring: {
            secretary: "Секретарь",
            ts_lastname: "Фамилия",
            ts_name: "Имя",
            srv_not_started: "Сервер не запущен",
            srv_started_on: "Сервер запущен на:",
            race_select: "Заезд",
            no_created_races: "Нет созданных заездов",
            chat_send: "Отправить",
            waiting_competitor: "Ожидание",
            result: "Рез-т",
            change_marks: "Изменить оценки",
            d_manual_scores: "Ручной ввод оценок",
            scoring_timer: "Время на оценку",
            judge_full: "Судья",
            judge_short: "С",
            chief_judge: "Ст. судья",
            publish: "Опубликовать",
            services: "Сервисы",
            turn_live: "Опубликовать",
            live_update: "Обновление",
            finished: "Финишировали",
            t_rank: "Место",
            t_st_num: "Ст. №",
            t_name: "Имя",
            t_result: "Результат",
            d_competitor: "Участник",
            d_result: "Результат",
            d_overall: "Общий",
          },
          protocols: {
            additional_settings: "Дополнительные настройки",
            b_add: "Добавить",
            b_edit: "Редактировать",
            b_preview: "Просмотр",
            b_remove: "Удалить",
            b_save: "Сохранить",
            cell_settings: "Настройка ячейки",
            choose_race: "Выбрать заезд",
            current_val: "Текущее значение",
            empty_cell: "Пустая ячейка",
            f_export: "Экспорт",
            i_header: "Изображение верх",
            i_footer: "Изображение низ",
            i_logo: "Логотип",
            images: "Изображения",
            legend: "Легенда",
            notations: "Замечания",
            number_of_competitors: "Кол-во участников",
            p_jury_info: "Печатать информацию о жюри",
            p_forerunners: "Печатать открывающих",
            p_weather: "Печатать информацию о погоде",
            p_notations: "Печатать замечания",
            protocol_type: "Вид протокола",
            results: "Результаты",
            results_protocol: "Протокол результатов",
            row_even: "Чётные строки",
            row_odd: "Нечётные строки",
            start_protocol: "Стартовый протокол",
            start_time: "Время старта",
            t_align: "Выравнивание",
            t_cell: "Ячейка",
            t_font: "Шрифт",
            t_weight: "Жирность",
            t_width: "Ширина",
            title: "Название",
            use_interlace_highlighting: "Чрезстрочное подсвечивание",
          },
          license: {
            activation_title: "Активация продукта",
            activation: "Проверка лицензии...",
            key: "Ключ продукта",
            check: "Проверить",
          },
          dialogs: {
            d_accept: "Принять",
            d_cancel: "Отменить",
            d_choose: "Выбрать...",
            d_clear: "Очистить",
            d_close: "Закрыть",
            d_create: "Создать",
            d_delete: "Удалить",
            d_no: "Нет",
            d_text: "Данные заезда будут удалены",
            d_yes: "Да",
          },
        },
      },
      EN: {
        app: {
          menu: {
            competitionSettings: "Event",
            rulesSetup: "Settings",
            competitors: "Competitors",
            teams: "Teams",
            start_protocols: "Races",
            scoring: "Scoring",
            protocols: "Protocols",
            jumpCodes: "Jump codes",
          },
          event: {
            event_header: "Event",
            event_title: "Event title",
            competition_header: "Competition rulesSetup",
            forerunners: "Forerunners",
            number_of_competitions: "Number of competitions",
            main_data: {
              title: "Title",
              discipline: "Discipline",
              group: "group",
              date: "Date",
              country: "Country",
              location: "Place",
              provider: "Organization",
              providerTiming: "Scoring provider",
              codex: "Codex",
            },
            weather: "Weather",
          },
          server: {
            start_btn: "Start server",
            indicator: {
              on: "On",
              off: "Off",
            },
          },
          settings: {
            stages: {
              title: "Stages setup",
              no_stages: "No other stages",
              passed_number: "Passed number:",
              stage: "Stage",
              stages_grid: "Stages grid",
              reset_btn: "Reset",
            },
            precision: {
              result_precision: "Result precision",
            },
            race_results: {
              title: "Race result formula",
              by_judge: {
                ae: "AE",
                average: "Average",
                corridor: "Corridor",
                d_up: "Double Up",
                moguls: "Moguls",
                r_best: "Remove best",
                r_last: "Remove worst",
                sum: "Sum",
                ski_jumps: "Ski jumps",
                title: "By judge",
              },
              by_section: {
                title: "By sections",
                add_section: "Add section",
                new_section: "New section",
                d_coefficient: "Coefficient",
                coefficient: "Coeff.",
              },
            },
            overall_results: {
              title: "Stage result formula",
              best: "Best",
              sum: "Sum",
              average: "Average",
              abc: "ABC",
              b_o_a: "Best of All",
              b_o_n: "Best of N",
            },
          },
          competitors: {
            title: "Competitors",
            from_prev: "From previous stage",
            load_from_file: "Load from file",
            export_btn: "Export",
            d_competitor_info: "Competitor info",
            d_delete_competitor: "Remove competitor",
            create_competitor: "Create competitor",
            d_new_competitor: "New competitor",
            sheet_settings: "Sheet rulesSetup",
            d_add_col: "Add column",
            clear_table: "Clear table",
            d_delete_all: "Remove all competitors?",
          },
          races: {
            title: "Start lists",
            no_races: "No created races",
            no_selected_race: "Not selected",
            race: "Race",
            raceTitle: "Race title",
            create_race: "Create race",
            d_title: "Race title",
            d_add_all: "Add all",
            d_add_from_race: "Start order from",
            d_available: "Available competitors",
            d_start_order: "Start order",
            d_prev_race_order: "Previous race",
            d_num_of_competitors: "Number of competitors",
            add_competitors: "Add competitors",
            d_add_competitors_to: "Add competitors to",
            d_no_marks: "No marks",
            d_clear_results: "Clear race results",
            d_remove_from_race: "Remove from race",
            range_by_res: "Range by results",
            turn_over: "Turn over",
            shuffle: "Shuffle",
            export_race: "Export",
            clear_res: "Clear results",
          },
          scoring: {
            secretary: "Secretary",
            ts_lastname: "Lastname",
            ts_name: "Name",
            srv_not_started: "Server is not started",
            srv_started_on: "Server started on:",
            race_select: "Race",
            no_created_races: "No created races",
            chat_send: "Send",
            waiting_competitor: "Waiting",
            result: "Result",
            change_marks: "Change marks",
            d_manual_scores: "Manual scoring",
            scoring_timer: "Time for scoring",
            judge_full: "Judge",
            judge_short: "J",
            chief_judge: "Chief judge",
            publish: "Publish",
            services: "Services",
            turn_live: "Publish",
            live_update: "Update",
            finished: "Finished",
            t_rank: "Rank",
            t_st_num: "St. №",
            t_name: "Name",
            t_result: "Result",
            d_competitor: "Competitor",
            d_result: "Result",
            d_overall: "Overall",
          },
          protocols: {
            additional_settings: "Additional rulesSetup",
            b_preview: "Preview",
            b_add: "Add",
            b_edit: "Edit",
            b_save: "Save",
            b_remove: "Remove",
            cell_settings: "Cell rulesSetup",
            choose_race: "Choose race",
            current_val: "Current value",
            empty_cell: "Empty cell",
            f_export: "Export",
            i_footer: "Bottom image",
            i_header: "Top image",
            i_logo: "Logo image",
            images: "Images",
            legend: "Legend",
            notations: "Notations",
            number_of_competitors: "Number of competitors",
            p_jury_info: "Print jury info",
            p_forerunners: "Print forerunners",
            p_weather: "Print weather",
            p_notations: "Print notations",
            protocol_type: "Protocol type",
            results: "Results",
            results_protocol: "Results protocol",
            row_even: "Even rows",
            row_odd: "Odd rows",
            start_protocol: "Start protocol",
            start_time: "Start time",
            t_align: "Align",
            t_cell: "Cell",
            t_font: "Font",
            t_weight: "Weight",
            t_width: "Width",
            title: "Title",
            use_interlace_highlighting: "Interlace highlighting",
          },
          license: {
            activation_title: "Product activation",
            activation: "Checking license...",
            key: "Product key",
            check: "Check",
          },
          dialogs: {
            d_accept: "Accept",
            d_cancel: "Cancel",
            d_choose: "Choose...",
            d_close: "Close",
            d_create: "Create",
            d_delete: "Delete",
            d_text: "Race data will be erased",
            d_no: "No",
            d_yes: "Yes",
          },
        },
      },
    },
  },
  getters: {
    lang: (state) => state.lang,
    lang_list: (state) => state.lang_list,
    localization: (state) => state.localization,
  },
  mutations: {
    change_lang: (state, lang) => {
      state.lang = lang;
    },
  },
  actions: {
    CHANGE_LANG: ({ commit }, lang) => commit("change_lang", lang),
  },
};
