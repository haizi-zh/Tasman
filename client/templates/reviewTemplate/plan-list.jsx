CmsGenerated = new Mongo.Collection('CmsGenerated');

var extractPlan = (plan) => {
  let container = {
    'position': 'relative'
  };
  let div_a_style = {
    'margin': '3px 7px',
    'display': 'inline-block'
  };
  let plan_detail_wrap_style = {
    'margin': '3px 10px 0',
    'borderLeft': '3px solid #4CAF50',
    'paddingLeft': '7px',
    'display': 'inline-block',
    'width': '60%'
  };
  let div_btn_wrap = {
    'float': 'right',
    'display': 'inline-block'
  };
  if(!plan.detail || plan.detail.length === 0){return ;}
  let id = plan._id;
  return (
      <div style={container}>
        <div style={plan_detail_wrap_style}>
          {
            plan.detail.map((oneDay) => {
              return (
                  <div key={oneDay.dayIndex}>
                    <label>{`第 ${oneDay.dayIndex} 天`}</label>
                    {
                      oneDay.pois.map((poi) => {
                        let url = `${poi.type}/${poi.id}`;
                        return (
                            <div key={poi.id} style={div_a_style}>
                              <a href={url}>{poi.name}</a>
                            </div>
                        )
                      })
                    }
                  </div>
              )
            })
          }
        </div>
        <div style={div_btn_wrap}>
          <PlanOptBtns pid={id._str}/>
        </div>
      </div>
  )
};

const {
  ListItem,
  List,
  Avatar,
  RaisedButton,
  IconButton,
  FontIcon,
  Toggle,
  CircularProgress,
  ListDivider,
  ContentInbox,
  ActionGrade,
  ContentSend,
  rightIconMenu
} = mui;

injectTapEventPlugin();

// root 节点
PlansGenerated = React.createClass({
  mixins: [ReactMeteorData],
  getDefaultProps: function() {
    return {
      'targetCity': 'all'
    };
  },
  PropTypes: {
    targetCity: React.PropTypes.string
  },
  getMeteorData: function() {
    let city = this.props.targetCity;
    var handle = Meteor.subscribe("CmsGeneratedPlan", city);
    return {
      loading: ! handle.ready(),
      plans: CmsGenerated.find({}).fetch()
    };
  },
  childContextTypes: {
    muiTheme: React.PropTypes.object
  },
  render: function() {
    if (this.data.loading) {
      return <LoadingSpinner />;
    }
    return (
      <PlanList plans={this.data.plans} />
    );
  }
});


var LoadingSpinner = React.createClass({
  render() {
    return <CircularProgress mode="indeterminate" />;
  }
});


var PlanList = React.createClass({
  getInitialState: function() {
    return {'activePlanId': undefined};
  },
  propTypes: {
    plans: React.PropTypes.array
  },
  setActivePlan(id) {
    this.setState({'activePlanId': id});
  },
  render() {
    var self = this;
    var plans = this.props.plans;
    return (
      <List>
        {
          plans.map(function(plan) {
            let id = plan._id._str;
            let style = {'display': id === self.state.activePlanId ? 'block': 'none'};
            return (<PlanItem key={id} style={style} plan={plan} setActivePlan={self.setActivePlan}/>)
          })
        }
      </List>
    );
  }
});


var PlanItem = React.createClass({
  propTypes: {
    plan: React.PropTypes.object,
    style: React.PropTypes.object,
    setActivePlan: React.PropTypes.func
  },
  clickHandler(id) {
    this.props.setActivePlan(id);
  },
  render() {
    let plan = this.props.plan;
    let style = this.props.style;
    let id = plan._id._str;
    return (
      <div key={id}>
        <ListItem
          id={id}
          key={id}
          primaryText={plan.locName}
          onClick={this.clickHandler.bind(this, id)}>
        </ListItem>
        <div style={style}>
          {extractPlan(plan)}
        </div>
        <ListDivider />
      </div>
    )
  }
});

/*
* 按钮组件
* 上线和删除
* */
var PlanOptBtns = React.createClass({
  propTypes: {
    pid: React.PropTypes.string
  },
  getInitialState() {
    return {'clickProcess': false};
  },
  clickAction() {
    this.setState({'clickProcess': true});
  },
  clickActionEnd() {
    this.setState({'clickProcess': false});
  },
  pushOnline() {
    this.clickAction();
    var self = this;
    Meteor.call('push-plan-online', this.props.pid, function(err, res) {
      if(!err && res.code === 0) {
        self.clickActionEnd();
        throwError(res.msg);
      }
    });
  },
  delPlan() {
    var res = confirm('确认要删除该游记?');
    if (!res) {return;}
    Meteor.call('del-plan', this.props.pid, function(err, res) {
      if(!err && res.code === 0) {
        throwError(res.msg);
      }
    });
  },
  render: function() {
    let style = {'marginRight': '10px'};
    return (
      <div>
        <RaisedButton secondary={true} label={this.state.clickProcess ? '上线中...' : '上线'} onClick={this.pushOnline} style={style} />
        <RaisedButton primary={true} label="删除" onClick={this.delPlan}/>
      </div>
    );
  }
});