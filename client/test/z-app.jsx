let ThemeManager = new mui.Styles.ThemeManager();

const {
    FlatButton,
    RaisedButton,
    Toggle,
    Checkbox
    } = mui;



let App = React.createClass({
    childContextTypes: {
        muiTheme: React.PropTypes.object
    },
    getChildContext() {
        return {
            muiTheme: ThemeManager.getCurrentTheme()
        };
    },
    getInitialState: function () {
        return {
            'city': 'all'
        }
    },
    setCity(cityName) {
        this.setState({
            'city': cityName
        });
    },
    render() {
        let targetCity = this.state.city;
        return (
            <div>
                <CityTarget setCity={this.setCity} targetCity={targetCity} />
                <PlansGenerated targetCity={targetCity} />
            </div>
        )
    }
});


let CityTarget = React.createClass({
    PropTypes: {
        'setCity': React.PropTypes.func,
        'targetCity': React.PropTypes.string
    },

    getDefaultProps: function() {
        return {
            'targetCity': 'all'
        }
    },
    getInitialState: function() {
        return {
            'cities': [],
            'showCities': true
        };
    },
    clickHandler: function(cityName) {
        this.props.setCity(cityName);
    },
    toggleCities() {
        let cities = this.state.cities;
        let showCities = !this.state.showCities;
        this.setState({
            'cities': cities,
            'showCities': showCities
        });
    },
    componentDidMount: function() {
        var self = this;
        Meteor.call('citiesHasPlan', function(err, res) {
            self.setState({'cities': res, 'showCities': true});
        });
    },
    render() {
        let self = this;
        let cities = self.state.cities;
        let cityWrapper = {
            'display': self.state.showCities ? 'block': 'none'
        };
        let tips = self.props.targetCity !== 'all'? `当前城市: ${self.props.targetCity}` : '所有城市';
        let toggleHiddenCities = {
            'width': '200px',
            'display': 'inline-block'
        };
        let toggleHiddenOnlined = {
            'width': '110px',
            'display': 'inline-block'
        }
        return (
            <div>
                <div style={toggleHiddenCities}>
                    <Toggle
                        name="showCity"
                        value=""
                        label={tips}
                        labelPosition="right"
                        onToggle={self.toggleCities}
                        defaultToggled={true}/>
                </div>
                <div style={toggleHiddenOnlined}>
                    <Checkbox
                        name="only-see-un-online"
                        value="checkbox"
                        labelPosition="left"
                        label="未上线:"/>
                </div>
                <div style={cityWrapper}>
                {
                    cities.map((city) => {
                        let label_style = {'margin': '3px 7px'};
                        if (self.props.targetCity === city.name) {
                            label_style.backgroundColor = '#A7FFEB';
                        }
                        return <FlatButton label={city.name} key={city.name} style={label_style}
                                    onClick={self.clickHandler.bind(self, city.name)} primary={!city.online} secondary={!city.online} />;
                    })
                }
                </div>
            </div>
        );
    }
})


Template.test.onRendered(function() {
    React.render(<App />, document.getElementById('plan-list'));
});