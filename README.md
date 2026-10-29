# Как запустить и прогнать тесты

После

```
npm ci
```

Сами тесты:

```
npm test
```

+

```
npm run typecheck
```

Демо-сценарий:

```
npm start
```

или

```
npx tsx src/main.ts
```

# Обзор архитектуры

Корень композиции - src/main.ts

Он импортирует конфиги, создает и связывает все высокоуровневые объекты, создает зоны, а также реализует демо-сценарий

Для зон, игроков и фракций создается по одному реестру, в них хранятся модели - состояния сущностей

Реестр с моделями является единым источником правды о состоянии моделей, например, зон, их владельцах и прогрессе захвата

Внешний код получает доступ к зонам только через ZonesAPI, который отдает снимки состояний зон IZoneState

Есть также PlayersAPI для управления игроками

timeProvider двигает время вперед, пока только вручную (тиками или миллисекундами), но интерфейс позволяет добавлять реализации по необходимости

Вместо событий в timeProvider регистрируются сервисы: доход и захват зон

Так код читается более прямолинейно и позволяет контролировать порядок срабатывания сервисов

Каждый тик timeProvider дергает зарегистрированные в нем сервисы

Сервисы связывают правила игры, выраженные юзкейсами, и отправляют события через шину событий

Юзкейсы не зависят от сервисов, а модели не зависят от юзкейсов, т.е. зависимости направлены внутрь

Сервис дохода обходит все зоны из реестра зон и вызывает юзкейс + событие выплаты для зон, у которых есть владелец

Сервис захвата зон для каждой зоны считает кол-во игроков каждой фракции, которые в ней находятся, и выбирает, какое правило применить

Он вызывает юзкейсы по очереди в зависимости от ситуации на поле и решает, какие события отправлять по результатам работы юзкейсов

События отправляются через шину событий вместо EventEmitter'ов, это позволяет проверять имена и типы данных событий, а также иметь единую точку подписки для ZonesAPI.on

Юзкейсы изменяют зоны и балансы фракций, а игроков меняет PlayersAPI напрямую, потому что там нет правил, а только проверка данных

Модели содержат данные (свое состояние) и минимум поведения, защищают себя только от некорректных данных, а инварианты состояний обеспечивает модуль в целом, т.е. юзкейсы

Юзкейсы - это небольшие атомарные операции, которые не зависят от источника времени, что делает их простыми для тестирования по отдельности

Это дает гибкость и возможность менять правила в разных режимах игры или на разных серверах, сохраняя структуру данных моделей

# Как добавляется зона

Папка

```
src/Configs
```

содержит файл zonesConfig.ts, в котором перечислены все зоны, нужно только дописать объект в массив:

```
export const zonesConfig: readonly IZoneConfig[] = [
    {
        id: "field",
        center: { x: 0, y: 0 },
        radius: 50,
        initialOwningFactionId: null,
    },
    {
        id: "docks",
        center: { x: -200, y: 0 },
        radius: 50,
        initialOwningFactionId: "red",
    },
    {
        id: "factory",
        center: { x: 200, y: 0 },
        radius: 50,
        initialOwningFactionId: "blue",
        incomeAmount: 50,
        incomeIntervalMs: 10_000,
    },
];
```

Обязательных параметра только 4 по контракту IZoneConfig:

```
export interface IZoneConfig {
    readonly id: string;
    readonly center: IVector2;
    readonly radius: number;
    readonly initialOwningFactionId: string | null;

    readonly incomeAmount?: number;
    readonly incomeIntervalMs?: number;
    readonly captureThreshold?: number;
    readonly capturingPlayersLimit?: number;
    readonly captureRatePerPlayerPerSecond?: number;
    readonly captureDecayRatePerSecond?: number;
}
```

Остальные параметры, если не указаны, берутся из файла globalConfig.ts:

```
export const globalConfig: IGlobalConfig = {
    tickIntervalMs: 50,
    defaultZoneIncomeAmount: 100,
    defaultZoneIncomeIntervalMs: 5_000,
    defaultZoneCaptureThreshold: 100,
    defaultZoneCapturingPlayersLimit: 10,
    defaultZoneCaptureRatePerPlayerPerSecond: 1,
    defaultZoneCaptureDecayRatePerSecond: 20,
    factionIds: [
        "red",
        "green",
        "blue",
    ],
};
```
