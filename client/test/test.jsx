CmsGenerated = new Mongo.Collection('CmsGenerated');

var PlansGenerated = React.createClass({
  // 这样写不行，报错：在render中找不到loading
  // mixins: funtion () {
  //   return [ReactMeteorData];
  // },
  mixins: [ReactMeteorData],
  getMeteorData: function() {
    var handle = Meteor.subscribe("CmsGeneratedPlan");
    return {
      loading: ! handle.ready(),
      plans: CmsGenerated.find({}).fetch()
    };
  },
  render: function() {
    // 如果数据尚未订阅好，则显示加载中
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
    return <div> 加载中...</div>;
  }
});

var PlanList = React.createClass({
  render() {
    var plans = this.props.plans;
    return (
      <ul>
        {plans.map(function(plan) {
          return <li id={plan._id._str} key={plan._id._str}>{plan.locName}</li>
        })}
      </ul>
    );
  }
});


var LikeButton = React.createClass({
  getInitialState: function() {
    return {liked: false};
  },
  handleClick: function(event) {
    this.setState({liked: !this.state.liked});
  },
  render: function() {
    var text = this.state.liked ? 'like' : 'haven\'t liked';
    return (
      <p onClick={this.handleClick}>
        You {text} this. Click to toggle.
      </p>
    );
  }
});

var SetIntervalMixin = {
  componentWillMount: function() {
    this.intervals = [];
  },
  setInterval: function() {
    this.intervals.push(setInterval.apply(null, arguments));
  },
  componentWillUnmount: function() {
    this.intervals.map(clearInterval);
  }
};

var TickTock = React.createClass({
  mixins: [SetIntervalMixin], // Use the mixin
  getInitialState: function() {
    return {seconds: 0};
  },
  componentDidMount: function() {
    this.setInterval(this.tick, 1000); // Call a method on the mixin
  },
  tick: function() {
    this.setState({seconds: this.state.seconds + 1});
  },
  render: function() {
    return (
      <p>
        React has been running for {this.state.seconds} seconds.
      </p>
    );
  }
});


Template.test.onRendered(function() {
  React.render(<PlansGenerated />, document.getElementById('plan-list'));
  React.render(<LikeButton />, document.getElementById('react-btn'));
  React.render(<TickTock />, document.getElementById('react-clock'));
});
