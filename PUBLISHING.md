# Публикация пакета T-Bank Payments

## Подготовка к публикации

### 1. Настройка NPM аккаунта

```bash
# Создайте аккаунт на npmjs.com если его нет
# Авторизуйтесь в npm
npm login
```

### 2. Обновление package.json

Перед публикацией обновите следующие поля в `package.json`:

```json
{
  "name": "tbank-payments",
  "version": "2.0.0",
  "author": "ваше_имя",
  "repository": {
    "type": "git",
    "url": "https://github.com/ваш_username/tbank-payments"
  },
  "bugs": {
    "url": "https://github.com/ваш_username/tbank-payments/issues"
  },
  "homepage": "https://github.com/ваш_username/tbank-payments#readme"
}
```

### 3. Создание Git репозитория

```bash
# Инициализируйте Git репозиторий
git init

# Добавьте файлы
git add .

# Создайте первый коммит
git commit -m "feat: initial release of T-Bank Payments library v2.0.0"

# Добавьте remote origin (замените на ваш репозиторий)
git remote add origin https://github.com/ваш_username/tbank-payments.git

# Запушьте код
git push -u origin main
```

### 4. Создание тега версии

```bash
# Создайте тег для версии
git tag v2.0.0

# Запушьте тег
git push origin v2.0.0
```

### 5. Тестирование перед публикацией

```bash
# Запустите тесты
npm test

# Проверьте что всё в порядке с пакетом
npm pack

# Посмотрите что будет опубликовано
npm publish --dry-run
```

### 6. Публикация

```bash
# Опубликуйте пакет
npm publish

# Если нужно опубликовать как scoped пакет:
# npm publish --access public
```

## После публикации

### Обновление README

Обновите бейджи в README.md:

```markdown
[![npm version](https://badge.fury.io/js/tbank-payments.svg)](https://badge.fury.io/js/tbank-payments)
[![npm downloads](https://img.shields.io/npm/dm/tbank-payments.svg)](https://npmjs.org/package/tbank-payments)
```

### Создание релиза на GitHub

1. Перейдите в раздел "Releases" вашего репозитория
2. Нажмите "Create a new release"
3. Выберите тег `v2.0.0`
4. Добавьте описание релиза:

```markdown
## T-Bank Payments v2.0.0 - Полная реализация API

### ✨ Новые возможности
- 🎯 Полная реализация всех методов T-Bank Acquiring API
- 🔧 Автоматическая генерация токенов
- ✅ Комплексная валидация параметров
- 🔒 Проверка подписей webhook-уведомлений
- 🧾 Вспомогательные методы для работы с чеками
- 📊 Поддержка всех способов оплаты (карты, СБП, QR-коды)

### 🚀 API методы
- Управление платежами (создание, подтверждение, отмена, статус)
- Работа с клиентами (добавление, получение, удаление)
- Управление картами (привязка, удаление, список)
- QR-коды и СБП (статические/динамические)
- Рекуррентные платежи

### 📚 Документация
- Подробный README с примерами
- Комплексные тесты (Jest)
- TypeScript поддержка (определения типов)
```

## Поддержание пакета

### Версионирование

Используйте [Semantic Versioning](https://semver.org/):

- `PATCH` (2.0.1) - исправления багов
- `MINOR` (2.1.0) - новые функции, обратная совместимость
- `MAJOR` (3.0.0) - breaking changes

```bash
# Обновление версии
npm version patch   # 2.0.0 -> 2.0.1
npm version minor   # 2.0.0 -> 2.1.0
npm version major   # 2.0.0 -> 3.0.0

# Автоматически создаст коммит и тег
git push --follow-tags

# Опубликуйте новую версию
npm publish
```

### Мониторинг

- Следите за issues на GitHub
- Отвечайте на вопросы пользователей
- Обновляйте документацию при изменениях в API T-Bank
- Регулярно обновляйте зависимости

### Continuous Integration

Рекомендуется настроить GitHub Actions для автоматического тестирования:

```yaml
# .github/workflows/test.yml
name: Test
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [14, 16, 18, 20]
    steps:
    - uses: actions/checkout@v3
    - uses: actions/setup-node@v3
      with:
        node-version: ${{ matrix.node-version }}
    - run: npm ci
    - run: npm test
```

## Лицензия и безопасность

- Убедитесь что лицензия MIT подходит для вашего случая
- Никогда не коммитьте реальные API ключи
- Регулярно проверяйте зависимости на уязвимости: `npm audit`
- Рассмотрите добавление `.nvmrc` файла для версии Node.js

## Полезные команды

```bash
# Информация о пакете
npm info tbank-payments

# Просмотр всех версий
npm view tbank-payments versions --json

# Отзыв версии (только в первые 72 часа)
npm unpublish tbank-payments@2.0.0

# Деинсталляция всего пакета (будьте осторожны!)
npm unpublish tbank-payments --force
``` 