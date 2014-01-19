Дамп всей БД
./mongodump --out /Volumes/Macintosh\ HD/Яндекс.Диск/meal/backup/dump/

Восстановление БД из дампа
./mongorestore /Volumes/Macintosh\ HD/Яндекс.Диск/meal/backup/dump/

Экспорт «таблицы» (коллекции) в JSON-файл
./mongoexport --db iate --collection products --out /Volumes/Macintosh\ HD/Яндекс.Диск/meal/backup/products.json