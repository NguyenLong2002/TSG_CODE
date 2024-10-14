import React, { Component } from 'react';
import { config } from "../../environment";
import { sp } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists/web";
import "@pnp/sp/items";

class EmployeeDetail extends Component {
  constructor(props) {
    super(props);
    sp.setup({ pageContext: { web: { absoluteUrl: config.url.API_URL } } });
    this.state = {
      employee: null,
      showAssets: false,  
      showContracts: false
    };
  }

  async componentDidMount() {
    const { employee } = this.props;

    if (employee) {
      try {
        const contracts = await sp.web.lists
          .getByTitle("ContractEmployee")
          .items
          .filter(`employee_id eq '${employee.Id}'`)();

        const assets = await sp.web.lists
          .getByTitle("Asset")
          .items
          .filter(`employee_id eq '${employee.Id}'`)();

        const assetsName =  assets.map((item) => item.name).join(', ')
        const contractName =  contracts.map((item) => item.contractType).join(', ')


        const newEmployee = {
          ...employee,
          contracts: contractName,
          assets: assetsName, 
        };


        this.setState({
          employee: newEmployee,
        });
      } catch (error) {
        console.log(error);
      }
    }
  }

  handleOnAsset = () => {
    this.setState({ showAssets: !this.state.showAssets, showContracts: false });
  };

  handleOnContracts = () => {
    this.setState({ showContracts: !this.state.showContracts, showAssets: false });}

  formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  render() {
    const { employee, showAssets, showContracts } = this.state;

    if (!employee) {
      return null; 
    }

    const {
      Id,
      name,
      email,
      account,
      address,
      sex,
      PhoneNumber,
      department,
      employeeStatus,
      yob,
      startDate,
      assets,
      contracts,
    } = employee;

    return (
      <div className="px-1">
        <table className="table mt-2">
          <tbody>
            <tr>
              <th scope="row">ID</th>
              <td>{Id}</td>
            </tr>
            <tr>
              <th scope="row">Tên nhân viên</th>
              <td>{name}</td>
            </tr>
            <tr>
              <th scope="row">Tài khoản</th>
              <td>{account}</td>
            </tr>
            <tr>
              <th scope="row">Email</th>
              <td>{email}</td>
            </tr>
            <tr>
              <th scope="row">Số điện thoại</th>
              <td>{PhoneNumber}</td>
            </tr>
            <tr>
              <th scope="row">Giới tính</th>
              <td>{sex === "male" ? "nam" : "nữ"}</td>
            </tr>
            <tr>
              <th scope="row">Ngày sinh</th>
              <td>{this.formatDate(yob)}</td>
            </tr>
            <tr>
              <th scope="row">Địa chỉ</th>
              <td>{address}</td>
            </tr>
            <tr>
              <th scope="row">Phòng \ Ban</th>
              <td>{department}</td>
            </tr>
            <tr>
              <th scope="row">Ngày vào</th>
              <td>{this.formatDate(startDate)}</td>
            </tr>
            <tr>
              <th scope="row">Trạng thái nhân viên</th>
              <td>{employeeStatus === "working" ? "Đang làm việc" : "Đã nghỉ việc"}</td>
            </tr>
          </tbody>
        </table>

        <div className="d-flex justify-content-evenly">
          <button type="button" className="btn btn-primary btn-lg" onClick={this.handleOnAsset}>
            Tài sản giao cho nhân viên
          </button>

          <button type="button" className="btn btn-primary btn-lg" onClick={this.handleOnContracts}>
            Hợp đồng của nhân viên
          </button>
        </div>

        {showAssets && (
          <div className="mt-4">
            <table className="table">
              <thead>
                <tr>
                  <th scope="col">Tên nhân viên</th>
                  <th scope="col">Tài sản</th>
                </tr>
              </thead>
              <tbody>
                {assets ? (
                  
                    <tr >
                      <td>{name}</td>
                      <td>{assets}</td>
                    </tr>
                  
                ) : (
                  <tr>
                    <td>{name}</td>
                    <td>Không có tài sản gì</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {showContracts && (
          <div className="mt-4">
            <table className="table">
              <thead>
                <tr>
                  <th scope="col">Tên nhân viên</th>
                  <th scope="col">Loại hợp đồng</th>
                </tr>
              </thead>
              <tbody>
                
                { contracts ? (
                  
                  <tr>
                    <td>{name}</td>
                    <td>{contracts}</td>
                  </tr>
                
              ) : (
                <tr>
                    <td>{name}</td>
                    <td>Không có hợp đồng gì</td>
                  </tr>
              )}
              </tbody>
            </table>
          </div>
        )}

        {(!showAssets) && !showContracts && (
          <div className="mt-4">
          </div>
        )}
      </div>
    );
  }
}

export default EmployeeDetail;
