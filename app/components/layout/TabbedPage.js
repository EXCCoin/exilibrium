import { Switch, Route, matchPath } from "react-router-dom";
import { isArray } from "util";
import { RoutedTabsHeader, RoutedTab } from "shared";
import { routing } from "connectors";
import { TransitionMotion, spring } from "react-motion";
import theme from "theme";
import { createElement } from "react";

function getTabs(tabs) {
  return tabs.map((c, i) => ({ index: i, tab: c }));
}

@autobind
class TabbedPage extends React.Component {
  constructor(props) {
    super(props);
    this._tabs = getTabs(props.tabs);
    const matchedTab = this.matchedTab(props.location);
    const styles = this.getStyles(matchedTab);
    this.state = { matchedTab, dir: "l2r", styles };
  }

  componentDidUpdate(prevProps) {
    if (this.props.tabs !== prevProps.tabs) {
      this._tabs = getTabs(prevProps.tabs);
    }

    if (this.props.location !== prevProps.location) {
      const matchedTab = this.matchedTab(this.props.location);
      const dir =
        this.state.matchedTab && matchedTab && this.state.matchedTab.index > matchedTab.index
          ? "r2l"
          : "l2r";
      const styles = this.getStyles(matchedTab);
      this.setState({ matchedTab, dir, styles });
    }
  }

  matchedTab(location) {
    return this._tabs.find(t => Boolean(matchPath(location.pathname, { path: t.tab.path })));
  }

  getStyles(matchedTab) {
    if (!matchedTab) {
      return [];
    }
    const element = createElement(matchedTab.tab.component, { ...matchedTab.tab }, null);
    return [
      {
        key: matchedTab.tab.path,
        data: { matchedTab, element },
        style: { left: spring(0, theme("springs.tab")) }
      }
    ];
  }

  willLeave() {
    const pos = this.state.dir === "l2r" ? -1000 : +1000;
    return { left: spring(pos, spring(theme("springs.tab"))) };
  }

  willEnter() {
    const pos = this.state.dir === "l2r" ? +1000 : -1000;
    return { left: pos };
  }

  scrollbarOverlayGetStyles(showScroll) {
    if (!showScroll) {
      return [];
    }

    return [
      {
        key: "scrollbar",
        data: {},
        style: { opacity: spring(1, theme("springs.tab")) }
      }
    ];
  }

  scrollbarOverlayWillLeave() {
    return { opacity: spring(0, theme("springs.tab")) };
  }

  render() {
    const { header, tabs } = this.props;
    let { children } = this.props;
    if (!isArray(children)) {
      children = [children];
    }
    const nonTabs = children;
    const tabHeaders = tabs.map(tab => RoutedTab(tab.path, tab.link));
    const headers = tabs.map(tab => (
      <Route key={tab.path} path={tab.path} component={tab.header} />
    ));
    return (
      <div className="tabbed-page">
        <div className="tabbed-page-header">
          {header}
          <Switch>{headers}</Switch>
          <RoutedTabsHeader tabs={tabHeaders} />
        </div>

        <div className="tabbed-page-body">
          <TransitionMotion
            styles={this.state.styles}
            willLeave={this.willLeave}
            willEnter={this.willEnter}>
            {interpolatedStyles => (
              <Aux>
                {interpolatedStyles.map(s => (
                  <div
                    className={["tab-content", Math.abs(s.style.left) < 0.1 ? "visible" : ""].join(
                      " "
                    )}
                    style={{ left: s.style.left, right: -s.style.left }}
                    key={s.key}>
                    {s.data.element}
                  </div>
                ))}
                <TransitionMotion
                  styles={this.scrollbarOverlayGetStyles(interpolatedStyles.length !== 1)}
                  willLeave={this.scrollbarOverlayWillLeave}>
                  {sbStyle => (
                    <Aux>
                      {sbStyle.map(s => (
                        <div
                          className="scrollbar-overlay"
                          key={s.key}
                          style={{ opacity: s.style.opacity }}
                        />
                      ))}
                    </Aux>
                  )}
                </TransitionMotion>
              </Aux>
            )}
          </TransitionMotion>
          {nonTabs}
        </div>
      </div>
    );
  }
}

export default routing(TabbedPage);
