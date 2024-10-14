import React, { Component } from 'react';
import { sp } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";

export default class EmployeeFormEdit extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: props.employee.name,
      Email: props.employee.email,
      account: props.employee.account,
      address: props.employee.address,
      PhoneNumber: props.employee.PhoneNumber,
      department: props.employee.department,
      sex: props.employee.sex,
      yob: props.employee.yob,
      startDate: props.employee.startDate,
      employeeStatus: props.employee.employeeStatus,
      searchUser: props.employee.user,
      user: props.employee.userId,
      userSearchResults: [] 
    };
  }

  handleInputChange = (event) => {
    const { name, value } = event.target;
    this.setState({ [name]: value });
  };

  handleUserSearchChange = async (event) => {
    const searchUser = event.target.value;
    this.setState({ searchUser });

    if (searchUser) {
      const userSearchResults = await this.searchPeoplePicker(searchUser);
      const userInfoList = userSearchResults.map(item => ({
        ...item,
        userEmail: item.Description,
        pictureUrl: `https://tsgvietnam.sharepoint.com/sites/dev/CuongTest/_layouts/15/userphoto.aspx?size=M&username=${item.EntityData.Email}`
      }));
      this.setState({ userSearchResults: userInfoList });
    } else {
      this.setState({ userSearchResults: [] });
    }
  };

  searchPeoplePicker = async (query) => {
    let arrPeople = [];
    try {
      const entries = await sp.profiles.clientPeoplePickerSearchUser({
        MaximumEntitySuggestions: 7,
        PrincipalSource: 15,
        PrincipalType: 1,
        QueryString: query,
      });
      arrPeople = entries;
    } catch (error) {
      console.error(error);
    }
    return arrPeople;
  };

  handleUserSelect = async (user) => {
    const userInfo = await this.GetInforUser_NCache(user.Key);
    console.log(userInfo);
    this.setState({
        
      searchUser: userInfo.UserTitle,
      user: {
        userName: userInfo.UserTitle,
        userId: userInfo.UserId,
      },
      userSearchResults: [] 
    });
  };

  GetInforUser_NCache = async (Key) => {
    const user = await sp.web.ensureUser(Key);
    return user ? {
      UserId: user.data.Id,
      UserTitle: user.data.Title,
      UserEmail: user.data.LoginName.split('|')[2],
    } : '';
  };

  handleSubmit = async (event) => {
    event.preventDefault();
    const { name, Email, account, address, PhoneNumber, department, sex, yob, startDate, employeeStatus, user } = this.state;

    const updatedEmployee = {
      name,
      email: Email,
      account,
      address,
      PhoneNumber,
      department,
      sex,
      yob,
      startDate,
      employeeStatus,
      userId: user.userId
    };

    try {
      await sp.web.lists
        .getByTitle("ListEmployees")
        .items
        .getById(this.props.employee.Id)
        .update(updatedEmployee);

      alert('Cập nhật thành công!');
      this.props.onClose();
      this.props.onReload();
    } catch (error) {
      console.error('Error updating employee:', error);
      alert('Cập nhật thất bại! Hãy thử lại.');
    }
  };

  formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  render() {
    const { name, Email, account, address, PhoneNumber, department, sex, yob, startDate, employeeStatus, searchUser, userSearchResults } = this.state;

    return (
      <div>
        <form className="row g-3 needs-validation" onSubmit={this.handleSubmit} noValidate>
          {/* Employee Details */}
          <div className="col-md-4">
            <label htmlFor="name" className="form-label">Tên nhân viên</label>
            <input
              type="text"
              className="form-control"
              id="name"
              name="name"
              value={name}
              onChange={this.handleInputChange}
              required
            />
          </div>
          <div className="col-md-4">
            <label htmlFor="Email" className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              id="Email"
              name="Email"
              value={Email}
              onChange={this.handleInputChange}
              required
            />
          </div>
          <div className="col-md-4">
            <label htmlFor="account" className="form-label">Tài khoản</label>
            <input
              type="text"
              className="form-control"
              id="account"
              name="account"
              value={account}
              onChange={this.handleInputChange}
              required
            />
          </div>
          <div className="col-md-4">
            <label htmlFor="address" className="form-label">Địa chỉ</label>
            <input
              type="text"
              className="form-control"
              id="address"
              name="address"
              value={address}
              onChange={this.handleInputChange}
              required
            />
          </div>
          <div className="col-md-4">
            <label htmlFor="PhoneNumber" className="form-label">Số điện thoại</label>
            <input
              type="text"
              className="form-control"
              id="PhoneNumber"
              name="PhoneNumber"
              value={PhoneNumber}
              onChange={this.handleInputChange}
              required
            />
          </div>
          <div className="col-md-4">
            <label htmlFor="department" className="form-label">Phòng \ Ban</label>
            <input
              type="text"
              className="form-control"
              id="department"
              name="department"
              value={department}
              onChange={this.handleInputChange}
              required
            />
          </div>
          <div className="col-md-4">
            <label htmlFor="sex" className="form-label">Giới tính</label>
            <select
              className="form-select"
              id="sex"
              name="sex"
              value={sex}
              onChange={this.handleInputChange}
              required
            >
              <option disabled value="">Choose...</option>
              <option value="male">Nam</option>
              <option value="female">Nữ</option>
              <option value="other">Khác</option>
            </select>
          </div>
          <div className="col-md-4">
            <label htmlFor="yob" className="form-label">Ngày sinh</label>
            <input
              type="date"
              className="form-control"
              id="yob"
              name="yob"
              value={this.formatDate(yob)}
              onChange={this.handleInputChange}
              required
            />
          </div>
          <div className="col-md-4">
            <label htmlFor="startDate" className="form-label">Ngày vào</label>
            <input
              type="date"
              className="form-control"
              id="startDate"
              name="startDate"
              value={this.formatDate(startDate)}
              onChange={this.handleInputChange}
              required
            />
          </div>
          <div className="col-md-4">
            <label htmlFor="employeeStatus" className="form-label">Tình trạng làm việc</label>
            <select
              className="form-select"
              id="employeeStatus"
              name="employeeStatus"
              value={employeeStatus}
              onChange={this.handleInputChange}
              required
            >
              <option disabled value="">Choose...</option>
              <option value="working">Đang làm việc</option>
              <option value="noWorking">Đã nghỉ việc</option>
            </select>
          </div>

          {/* User Search */}
          <div className="col-md-4">
            <label htmlFor="user" className="form-label">User</label>
            <div className="position-relative">
              <input
                type="text"
                value={searchUser}
                onChange={this.handleUserSearchChange}
                placeholder="Nhập tên ..."
                className="form-control"
                style={{ width: '300px' }}
              />

              {searchUser && userSearchResults.length > 0 && (
                <div className="position-absolute w-100 bg-white border rounded shadow-sm mt-1" style={{ zIndex: 1000 }}>
                  <ul className="list-group" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                    {userSearchResults.map((user) => (
                      <li key={user.Key} className="list-group-item list-group-item-action" onClick={() => this.handleUserSelect(user)}>
                        <div className="d-flex align-items-center">
                          <img
                            src={user.pictureUrl}
                            alt={user.DisplayText}
                            className="avatar me-2"
                            style={{ width: '40px', height: '40px', borderRadius: '50%' }}
                          />
                          <div>
                            <p className="mb-0 fw-normal">{user.DisplayText}</p>
                            <p className="mb-0 fw-light">{user.userEmail}</p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div className="col-12">
            <button className="btn btn-primary" type="submit">Cập nhật</button>
          </div>
        </form>
      </div>
    );
  }
}
