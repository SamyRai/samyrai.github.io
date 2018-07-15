---
layout: post
title: Executing long running tasks on Heroku
subtitle: When SSH connection exits with timeout
date: 2018-07-13
background: /img/posts/post3.jpg
published: true
---

In our company we have rake tasks that operates huge amounts of data and they are triggered everyday by `Heroku Scheduler`. Once a rake task failed and I wanted to execute it manually. Unfortunately, execution of this huge command took too long and Heroku threw a connection timeout. Of cause execution of command stopped as well. But there is a way how to execute long running commands better: use `heroku run:detached`.

Example:
```sh
heroku run:detached rails runner 'Class.big_task_methor' -r heroku -a App
```

As a result Heroku will provide you with command

```
Run heroku logs --app AAA --dyno run.7619 to view the output.
```

where you can see the logs.
