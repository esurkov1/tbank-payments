# Руководство по внесению вклада

Спасибо за интерес к проекту! Мы рады вашему вкладу.

## Как внести вклад

### Сообщение об ошибке

Если вы нашли ошибку, пожалуйста, создайте issue с описанием:

- Что произошло
- Ожидаемое поведение
- Шаги для воспроизведения
- Версия библиотеки и Node.js
- Пример кода (если возможно)

### Предложение улучшений

Если у вас есть идея по улучшению библиотеки:

1. Создайте issue для обсуждения
2. Дождитесь обратной связи
3. После одобрения создайте Pull Request

### Добавление нового метода API

Если нужно добавить новый метод API T-Bank:

1. Найдите соответствующий модуль в `lib/modules/`
2. Добавьте метод в модуль с валидацией через Joi
3. Добавьте метод в `lib/TbankPayments.js` в метод `_bindModuleMethods()`
4. Добавьте TypeScript типы в `index.d.ts`
5. Напишите тесты
6. Обновите README.md с примером использования

Пример:

```javascript
// lib/modules/payment-initiation.js
module.exports = {
  async newMethod(context, params) {
    const schema = Joi.object({
      // валидация
    });
    context.validator.validate(schema, params);
    return context.client.post('/v2/NewMethod', params);
  },
};
```

## Процесс разработки

### Настройка окружения

```bash
git clone https://github.com/esurkov1/tbank-payments.git
cd tbank-payments
npm install
```

### Запуск тестов

```bash
npm test
npm run test:watch
npm run test:coverage
```

### Линтинг и форматирование

```bash
npm run lint
npm run lint:fix
npm run format
npm run format:check
```

## Правила коммитов

Мы используем [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - новая функциональность
- `fix:` - исправление ошибки
- `docs:` - изменения в документации
- `style:` - форматирование кода
- `refactor:` - рефакторинг
- `test:` - добавление тестов
- `chore:` - обновление зависимостей, конфигурации

Примеры:

```
feat: добавить метод getTPayStatus
fix: исправить обработку ошибок в client.js
docs: обновить README с примерами
```

## Pull Request процесс

1. Создайте ветку от `main`: `git checkout -b feature/my-feature`
2. Внесите изменения
3. Убедитесь, что тесты проходят: `npm test`
4. Убедитесь, что линтер проходит: `npm run lint`
5. Убедитесь, что форматирование корректно: `npm run format:check`
6. Закоммитьте изменения: `git commit -m "feat: описание изменений"`
7. Отправьте PR: `git push origin feature/my-feature`
8. Дождитесь ревью и обратной связи

## Код-стайл

- Используйте ESLint и Prettier (настроены автоматически)
- Следуйте существующему стилю кода
- Добавляйте JSDoc комментарии для новых методов
- Добавляйте ссылки на официальную документацию в комментариях

## Вопросы?

Если у вас есть вопросы, создайте issue или свяжитесь с maintainer'ом.
