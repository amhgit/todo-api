readme.txt
mkdir todo-api
cd tod-api
git init
npm init
add .gitignore

napm install express

create app

test it in browser using port 3000

create heroku app

heroku create
heroku rename amh-todo-api

git status
git add .
git commit -am "todo Init Repo"
git push heroku master
heroku open

* to add postgre sql to heroku

heroku addons:create heroku-postgresql:hobby-dev
npm install pg --save
npm install pg-hstore --save