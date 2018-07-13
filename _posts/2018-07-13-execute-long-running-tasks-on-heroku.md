---
published: false
---
## How to execute long running tasks on Heroku

In our company we have rake tasks that operates huge ammounts of data and they are triggered everyday by `Heroku Scheduler`. Once a rake task failed and I wanted to execute it manually. Unfortunately, execution of this huge command took too long and Heroku throwed a connection timeout and cancelled it. Ofcause execution of command stopped as well. But there is a way how to handle it better: use `heroku run:detached`.

```sh
heroku run:detached rails runner 'Class.big_task_methor' -r heroku -a App
```

As a result Heroku will provide you with command 

```
Run heroku logs --app AAA --dyno run.7619 to view the output.
```

where you can see the output.