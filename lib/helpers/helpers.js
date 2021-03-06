//////////Generic Helper Functions///////////
//this function puts our cursor where it needs to be.
focusText = function (i,val) {
  i.focus();
  i.value = val ? val : "";
  i.select();
};

queryize = function (actionset) {
  var collection = actionset.query().collection
  var connection = actionset.query().subconnection
  var selector = actionset.query().selector()
  var sort = actionset.query().subsort
  return Mongo.Collection.get(collection, { connection: connection }).find(selector, {sort: sort}).fetch()
}


optional = Match.Optional

JSONize = function(str) {
  return str
    // wrap keys without quote with valid double quote
    .replace(/([\$\w]+)\s*:/g, function(_, $1){return '"'+$1+'":'})
    // replacing single quote wrapped ones to double quote
    .replace(/'([^']+)'/g, function(_, $1){return '"'+$1+'"'})
}

resolver_auth = function(context) {
  if (!context.user || context.user._id != Meteor.users.findOne({username: "admin"})._id) {
    console.log(Meteor.users.findOne({username: "admin"})._id)
    return {errors: ['', 'access denied']}
  }
}

resolvers_init = function(args) {
  errors = []
  options = {}
  limit = args.limit
  options.limit = limit
  delete args.limit
  skip = args.skip
  options.skip = skip
  delete args.skip
  collection = args.collection
  options.collection = collection
  delete args.collection
  if (args.selector) {
    selector = JSON.parse(JSONize(args.selector))
    options.selector = args.selector
    data = Mongo.Collection.get(collection).find(selector).fetch()
    inputpipe = data.map( function(item) {
      return item._id
    })
  }
  if (args.mutator) {
    mutator = JSON.parse(JSONize(args.mutator))
    options.mutator = args.mutator
    delete args.mutator
  }
  return Object.keys(args).sort().join(" ")
}

metaquery = function(cursor, options, args, errors) {
  var metaquery = {}
  metaquery.count = cursor ? cursor.count() : null
  metaquery.return = cursor ? cursor.fetch() : null
  metaquery.subtotal = cursor ? cursor.fetch().length : null
  metaquery.errors = errors
  return metaquery
}

metamutate = function(cursor, options, args, errors) {
  var metamutate = {}
  metamutate.count = cursor ? cursor.count() : null
  metamutate.return = cursor ? cursor.fetch() : null
  metamutate.subtotal = cursor ? cursor.fetch().length : null
  metamutate.errors = errors
  metamutate.collection = options.collection ? options.collection : null
  metamutate.op = args.op ? args.op : null
  metamutate.selector = options.selector ? options.selector : null
  console.log("options",options)
  return metamutate
}

adminUser = function (userId) {
  var adminUser = Meteor.users.findOne({username:"admin"})
  return (userId && adminUser && userId === adminUser._id)
}

project_infos = function() {
  var project_infos = [];
  var total_count = 0;

//the cursor below doesn't have the formattednow waiting field
  Taskspending.find({status: {$in: ["waiting", "pending"]}, tags: {$ne: "inbox"}, type: {$nin: ["textfile", "checklist"]}}).forEach(function (task) {
//the bottom may be for arrays of tags rather than the single project that is allowed
// _.each(task.project, function (project) {
      var project_info = _.find(project_infos, function (x) { return x.project === task.project; });
      if (! project_info) {
        project_infos.push({project: task.project, count: 1});
      }
      else {
        project_info.count++;
      }
// });
    total_count++;
  });

  project_infos = _.sortBy(project_infos, function (x) { return x.project; });
  project_infos.unshift({project: null, count: total_count});
  return project_infos;
}

somedaymaybe_infos = function () {
  var someday_maybe_infos = []
  Taskspending.find({$and: [{tags: "somedaymaybeproj"}, {tags: "largeroutcome"}]}).forEach(function (task) {
      var someday_maybe_info = _.find(someday_maybe_infos, function (x) { return x.project === task.project; });
      if (! someday_maybe_info) {
        someday_maybe_infos.push({project: task.project, count: 1});
      }
      else {
        someday_maybe_info.count++;
      }
  });
  return someday_maybe_infos
}

context_infos = function () {
  var context_infos = [];
  var total_count = 0;

  Taskspending.find({status: {$in: ["waiting", "pending"]}, tags: {$ne: "inbox"}}).forEach(function (task) {
//the bottom may be for arrays of tags rather than the single project that is allowed
// _.each(task.context, function (context) {
      var context_info = _.find(context_infos, function (x) { return x.context === task.context; });
      if (! context_info) {
        context_infos.push({context: task.context, count: 1});
      }
      else {
        context_info.count++;
      }
// });
    total_count++;
  });

  context_infos = _.sortBy(context_infos, function (x) { return x.context; });
  context_infos.unshift({context: null, count: total_count});
  return context_infos;

}

formattedNow = function() {
  now = moment()
  return now.format('YYYYMMDD') + 'T' + now.format('HHmmss') + 'Z'
}

formattedMoment = function(moment) {
  return moment.format('YYYYMMDD') + 'T' + moment.format('HHmmss') + 'Z'
}

formattedTomorrow = function () {
  now = moment()
  tomorrow = now.add(1, 'days')
  return tomorrow.format('YYYYMMDD') + 'T' + tomorrow.format('HHmmss') + 'Z'
}

simpleformattedtimestamp = function (time) {
  return time.replace(/T/, '').replace(/Z/, '')
}

timestamptomoment = function (timestamp) {
  var simpletimestamp = simpleformattedtimestamp(timestamp)
  return moment(simpletimestamp, "YYYY-MM-DD-HH-mm-ss")
}

selectTaskProcessing = function(e,t) {
  //Session.set('current_processedtask',this._id);
  //Session.set('processing_task',true);
  Meteor.flush()
};

removeItem = function(list_id,item_name) {
  if (!item_name&&!list_id)
    return;
  Taskspending.remove({_id:list_id});
};

updateProject = function(list_id,item_name,project_name) {
  var l = lists.findOne({"_id":list_id,"items.Name":item_name});
  if (l&&l.items){
    for (var i = 0; i<l.items.length; i++){
      if (l.items[i].Name === item_name){
          l.items[i].LentTo = project_name;
      }
    }
    lists.update({"_id":list_id},{$set:{"items":l.items}});
  }
};

selectDepProcessing = function(e,t) {
  //Session.set('current_deppingtask',this._id);
  //Session.set('depping_task',true);
  Meteor.flush()
  focusText(t.find(".modal .title"));
};

countdowntimer = function (due) {

  //var formattednow = Session.get("now")
  var newstringparts = due.substring(0,4) + "-" + due.substring(4,6) + "-" + due.substring(6,8) + "-" + due.substring(9,11) + "-" + due.substring(11,13) + "-" + due.substring(13,15)
  var newformattednow = formattednow.substring(0,4) + "-" + formattednow.substring(4,6) + "-" + formattednow.substring(6,8) + "-" + formattednow.substring(9,11) + "-" + formattednow.substring(11,13) + " " + formattednow.substring(13,15)

  var momenttwo = moment(newformattednow, "YYYY-MM-DD-HH-mm-ss")
  var momentone = moment(newstringparts, "YYYY-MM-DD-HH-mm-ss")

  var diff = momentone.diff(momenttwo, 'seconds')
  var clock = diff

  var timeLeft = function() {
    if (clock > 0) {
      var days = Math.floor(clock / 86400)
      var hours = Math.floor((clock - days * 86400) / 3600)
      var minutes = Math.floor((clock - days * 86400 - hours * 3600) / 60)
      var seconds = clock % 60
      return (days == 0 ? "" : days + " days ") + ((days == 0 && hours == 0) ? "" : (hours < 10 ? "0" : "") + hours + ":") + ((days == 0 && hours == 0 && minutes == 0) ? "" : ((days == 0 && hours == 0 && minutes < 10) ? "" : (minutes < 10 ? "0" : "")) + minutes + ":") + ((days == 0 && hours == 0 && minutes == 0) ? "" : (seconds < 10 ? "0" : "")) + seconds
    }
  }


  if ((clock == 262220) && Notification.permission === "granted") {
    var description = Taskspending.findOne({due: due}).description
    var options = {body: description + ' in three days'}
    var n = new Notification(description, options);

  }


  return timeLeft()
}
