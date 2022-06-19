# Рекомендательная система

## Инструкция для сайта

В npm установите следующие пакеты
```
react-bootstrap
bootstrap
chartjs
react-chartjs-2
react-widgets
```


Склонируйте репозиторий

```
npm install -g gatsby-cli

git clone https://github.com/swofde/recsys
```

В папке с проектом выполните следующую команду

```
gatsby develop
```

По адресу http://localhost:8000 запустится сервер с вашим сайтом

В файле src/pages/recsys.js в строках 141 и 219 необходимо будет заменить строку 

```
'https://functions.yandexcloud.net/ваша_яндекс_функция'
```
на адрес вашей Янедкс.Функции

## Инструкция для Яндекс.Функции

После настройки платежной информации и всего прочего в консоли Яндекс.Облака необходимо будет создать пустую функцию. 
Во вкладке 'Редактор' необходимо будет выгрузить два файла 

```
yandex_func.py

yandex_func_requirements.txt
```

Затем, в этой же вкладке переименовть файл yandex_func_requirements.txt на 

```
requirements.txt
```

После этого в поле 'Точка входа' задать значение 

```
yandex_func.handler
```

и в поле 'Переменные окружения' задать значения

```
SURPRISE_DATA_FOLDER = /function/code
```
