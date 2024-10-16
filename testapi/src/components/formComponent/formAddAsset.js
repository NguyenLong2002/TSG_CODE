import { Component } from 'react';
import { sp } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";

export default class formAddAssets extends Component {
  constructor(props) {
    super(props);
    this.state = {
      id : props.id,
      nameAsset: '',
      quantity:'',
      assets : [],
      code:''
    };
  }

  async componentDidMount() {
        try {
          const assets = await sp.web.lists
          .getByTitle("Asset")
          .items
          .getAll();
          console.log(assets);

        const assetsName = assets.map((item) => item);
        console.log(assetsName);

        this.setState({
            assets: assetsName,
          
        });

        } catch (error) {
        console.error('Error fetching employees:', error);
        if (error.response) {
            console.log('Response data:', error.response);
        }
        }
    }

    handleInputChange = (e) => {
      const { name, value } = e.target;
      this.setState({ [name]: value });
    }

handleSubmit = async (e) => {
  e.preventDefault();
  const { id, nameAsset, quantity, code } = this.state;
  console.log(id);

  try {
    const existingAssets = await sp.web.lists
      .getByTitle("Asset")
      .items
      .filter(`employee_id eq '${id}' and name eq '${nameAsset}'`)
      .get();

    if (existingAssets.length > 0) {
      const existingAsset = existingAssets[0];
      const newQuantity = parseInt(existingAsset.quantity) + parseInt(quantity); 

      await sp.web.lists
        .getByTitle("Asset")
        .items
        .getById(existingAsset.Id)
        .update({
          quantity: newQuantity.toString() 
        });
      alert('Đã cập nhật số lượng tài sản!');
    } else {
      const newItem = {
        employee_id: id.toString(),
        name: nameAsset,
        quantity: parseInt(quantity),
        id0: code.toString(),
      };

      await sp.web.lists.getByTitle("Asset").items.add(newItem);
      alert('Thêm tài sản thành công!');
    }

    this.setState({ nameAsset: '', quantity: '' });

    this.props.onReload();
  } catch (error) {
    console.error('Error adding or updating asset:', error);
  }
};
  handleChoose = (item) => {
    console.log(item.name);
  }

  render() {
    const { id,quantity,assets,nameAsset, code } = this.state;

    return (
        <form class="row g-3" onSubmit={this.handleSubmit}>
          <div class="col-md-2">
            <label for="id" class="form-label">Id</label>
            <input type="text" class="form-control " id="id" value={id} disabled />
          </div>
          <div class="col-md-2">
            <label for="id" class="form-label">Code</label>
            <input type="text" class="form-control " id="code" value={code} disabled />
          </div>
          <div class="col-md-4">
            <label for="nameAsset" class="form-label">Asset name</label>
            <select class="form-select" aria-label="Default select example"
              name="nameAsset"
              value={nameAsset}
              onChange={this.handleInputChange}>
              <option selected>Chọn tài sản</option>
              {
                assets.map((item) => (
                   <option value={item.name} onClick={()=>this.handleChoose(item)}>{item.name}</option>
                ))
              }
            </select>
          </div>
          <div class="col-md-4">
            <label for="quantity" class="form-label">Quantity</label>
            <input type="number" class="form-control" id="quantity" name="quantity" value={quantity} onChange={this.handleInputChange} required/>
            
          </div>
          <div class="col-12">
            <button class="btn btn-primary" type="submit">Add Asset</button>
          </div>
        </form>
     );
    }
}