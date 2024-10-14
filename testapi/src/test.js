import './App.css';
import { Component } from 'react';
import { config } from "./environment.js";
import { sp } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists/web";
import "@pnp/sp/items";

export default class Test extends Component {
  constructor(props) {
    super(props);
    sp.setup({ pageContext: { web: { absoluteUrl: config.url.API_URL } } });
    this.state = {
      listItems: [] 
    };
  }

  async componentDidMount() {
    try {
      const lists = await sp.web.lists
        .getByTitle("ListEmployees")
        .items
        .getAll(); 

      console.log(lists);

      this.setState({
        listItems: lists
      });
    } catch (error) {
      console.log(error);
    }
  }

  render() {
    const { listItems } = this.state; 

    return (
      <div>
        <ul>
          {listItems.length > 0 ? (
            listItems.map((item, index) => (
              <li key={index}>
                {item.Id} - {item.name} - {item.account}
              </li>
            ))
          ) : (
            <p>Loading...</p> 
          )}
        </ul>
      </div>
    );
  }
}
