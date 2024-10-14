import React, { Component } from 'react';
import { sp } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";

export default class EmployeeFormAdd extends Component {
  constructor(props) {
    super(props);
    this.state = {
      listEmployees:[],
      userSearchResults:[],
      selectedListUsers:[],
      listUserSearchResults: [],
      userListError:'',
      name: '',
      Email: '',
      account: '',
      address: '',
      PhoneNumber: '',
      department: '',
      sex: '',
      yob: '',
      startDate: '',
      employeeStatus: '',
      user:'',
      searchUser: '',
      searchListUser:'',
      errors: {},
      formSubmitted: false,
    };
  }

  validateField = (name, value, errors = {}) => {
    const patterns = {
        Email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        PhoneNumber: /^[0-9]{10,11}$/
    };

    const errorMessages = {
        name: !value ? "Tên nhân viên là bắt buộc." : '',
        Email: !value ? "Email là bắt buộc." : !patterns.Email.test(value) ? "Địa chỉ email không hợp lệ." : null,
        account: !value ? "Tài khoản là bắt buộc.": '',
        address: !value ? "Địa chỉ là bắt buộc.": '',
        PhoneNumber: !value ? "Số điện thoại là bắt buộc." : !patterns.PhoneNumber.test(value) ? "Số điện thoại không hợp lệ." : null,
        department: !value ? "Phòng / Ban là bắt buộc.": '',
        sex: !value ? "Giới tính là bắt buộc.": '',
        yob: !value ? "Ngày sinh là bắt buộc.": '',
        startDate: !value ? "Ngày vào là bắt buộc.": '',
        employeeStatus: !value ? "Tình trạng làm việc là bắt buộc.": '',
    };

    if (errorMessages[name]) {
        errors[name] = errorMessages[name];
    } else {
        delete errors[name];
    }

    return errors;
  };

  validateForm = () => {
    const { name, Email, account, address, PhoneNumber, department, sex, yob, startDate, employeeStatus, user ,selectedListUsers} = this.state;

    let errors = this.state.errors;

    errors = this.validateField('name', name, errors);
    errors = this.validateField('Email', Email, errors);
    errors = this.validateField('account', account, errors);
    errors = this.validateField('address', address, errors);
    errors = this.validateField('PhoneNumber', PhoneNumber, errors);
    errors = this.validateField('department', department, errors);
    errors = this.validateField('sex', sex, errors);
    errors = this.validateField('yob', yob, errors);
    errors = this.validateField('startDate', startDate, errors);
    errors = this.validateField('employeeStatus', employeeStatus, errors);

    if (!user || !user.userId) {
        errors.user = "Người dùng là bắt buộc.";
    }else{
        delete errors.user;
    }
console.log(selectedListUsers.length);
    if (selectedListUsers.length === 0) {
        errors.userListError = "Người dùng là bắt buộc. 2";
    }else{
        delete errors.userListError;
    }

    this.setState({ errors });

    // If there are no errors, return true
    return Object.keys(errors).length === 0;
 };


  async componentDidMount() {
        try {
        const listEmployees = await sp.web.lists
            .getByTitle("ListEmployees")
            .items
            .select("user/Title", "user/Name", "user/Id")
            .expand("user")
            .get();

        const formattedEmployees = listEmployees.map((e) => {
            let user = {
            UserName: "",
            UserId: "",
            UserEmail: ""
            };
            if (e.user) {
            user = {
                UserName: e.user.Title,
                UserId: e.user.Id,
                UserEmail: e["user"].Name.split("|")[2],
            };
            }
            
            return {
            user: user.UserName,
            userId: user.UserId,
            userEmail: user.UserEmail
            };
        });

        this.setState({
            listEmployees: formattedEmployees,
        });

        } catch (error) {
        console.error('Error fetching employees:', error);
        if (error.response) {
            console.log('Response data:', error.response);
        }
        }
    }

  async searchPeoplePicker(value) {
        let arrPeople = [];
        await sp.profiles
        .clientPeoplePickerSearchUser({
            MaximumEntitySuggestions: 10,
            PrincipalSource: 15,
            PrincipalType: 1,
            QueryString: value,
        })
        .then((entiries) => {
            arrPeople = entiries;
        })
        .catch((error) => {
            console.log(error);
        });
        return arrPeople;
    }

  async GetInforUser_NCache(Key) {
        let user = await sp.web.ensureUser(Key);
        let objUser = '';
        if (user) {
        objUser = {
            UserId: user.data.Id,
            UserTitle: user.data.Title,
            UserEmail: user.data.LoginName.split('|')[2],
            UserLoginName: user.data.LoginName,
        };
        }
        return objUser;
    }

    //Thêm 1 user vào trong database
  handleUserSearchChange = async (event) => {
    const searchUser = event.target.value;
    this.setState({ searchUser });

    if (searchUser) {
        const userSearchResults = await this.searchPeoplePicker(searchUser);

        const userInfoList = userSearchResults.map(item => {
            const userEmail = item.Description; 
            const urlPicture = `https://tsgvietnam.sharepoint.com/sites/dev/CuongTest/_layouts/15/userphoto.aspx?size=M&username=${item.EntityData.Email}`;
            return {
                ...item,
                userEmail: userEmail,
                pictureUrl: urlPicture    
            };
        });

        this.setState({ userSearchResults: userInfoList });
    } else {
        this.setState({ userSearchResults: [] });
    }
    };
  handleUserSelect = async (user) => {
        const userInfo = await this.GetInforUser_NCache(user.Key);

        this.setState({
            searchUser: userInfo.UserTitle,
            user: {
            userName: userInfo.UserTitle,
            userId: userInfo.UserId
            },
            userSearchResults: []
        });
    };

    //thêm nhiều user vào trong database
      handleListUserSearchChange = async (event) => {
        const searchListUser = event.target.value;
        this.setState({ searchListUser });

        if (searchListUser) {
        const listUserSearchResults = await this.searchPeoplePicker(searchListUser);

        const userInfoList = listUserSearchResults.map(item => {
            const userEmail = item.Description; 
            const urlPicture = `https://tsgvietnam.sharepoint.com/sites/dev/CuongTest/_layouts/15/userphoto.aspx?size=M&username=${item.EntityData.Email}`;
            return {
                ...item,
                userEmail: userEmail,
                pictureUrl: urlPicture    
            };
        });

        console.log(listUserSearchResults);

        this.setState({ listUserSearchResults: userInfoList });
        } else {
        this.setState({ listUserSearchResults: [] });
        }
    };


  handleListUserSelect = async (user) => {
    const userInfo = await this.GetInforUser_NCache(user.Key);
    console.log(userInfo);
    this.setState((prevState) => ({
      selectedListUsers: [
        ...prevState.selectedListUsers,
        { userId: userInfo.UserId, userName: userInfo.UserTitle }
      ],
      searchListUser: '', 
      listUserSearchResults: []
    }));
  };
  handleRemoveSelectedUser = (userId) => {
    this.setState((prevState) => ({
      selectedListUsers: prevState.selectedListUsers.filter(user => user.userId !== userId)
    }));
  };

    handleInputChange = (event) => {
    const { name, value } = event.target;
    this.setState({ [name]: value });

    const errors = this.validateField(name, value, { ...this.state.errors });
    this.setState({ errors });
    };


  handleSubmit = async (event) => {
    event.preventDefault();
    this.setState({ formSubmitted: true });
    if (this.validateForm()) {
    const { name, Email, account, address, PhoneNumber, department, sex, yob, startDate, employeeStatus, user,selectedListUsers } = this.state;
        
        const newItem = {
            name: name,  
            email: Email,
            account: account,
            address: address,
            PhoneNumber: PhoneNumber,
            department: department,
            sex: sex,
            yob: yob,
            startDate: startDate,
            employeeStatus: employeeStatus,      
            userId: user.userId,
            listUserId: {results:selectedListUsers.map(user => user.userId)},
        };

        try {
            await sp.web.lists
            .getByTitle("ListEmployees")
            .items
            .add(newItem);
            alert('Thêm nhân viên thành công!');

            
      this.setState(this.getInitialState());

            this.props.onReload();

            this.props.onClose();  


        } catch (error) {
            console.error('Error adding employee:', error);
        }
    }
    };

    getInitialState = () => ({
        name: '', 
        Email: '', 
        account: '', 
        address: '', 
        PhoneNumber: '', 
        department: '', 
        sex: '', 
        yob: '', 
        startDate: '', 
        employeeStatus: '', 
        searchUser: '', 
        user: null, 
        listUser:null,
        errors: {}
    });


  render() {
    const { 
        name, 
        Email,
        account, 
        address, 
        PhoneNumber, 
        department, 
        sex, 
        yob, 
        startDate, 
        employeeStatus,
        searchUser,
        userSearchResults, 
        errors ,
        formSubmitted,
        searchListUser,
        selectedListUsers,
        listUserSearchResults
    } = this.state;

    return (
      <div>
        <form className="row g-3 needs-validation" onSubmit={this.handleSubmit} noValidate>
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
            {formSubmitted && errors.name && <div className="text-danger">{errors.name}</div>}
          </div>
          <div className="col-md-4">
            <label htmlFor="Email" className="form-label">Email</label>
            <input
              type="Email"
              className="form-control"
              id="Email"
              name="Email"
              value={Email}
              onChange={this.handleInputChange}
              required
            />
            {formSubmitted && errors.Email && <div className="text-danger">{errors.Email}</div>}
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
            {errors.account && <div className="text-danger">{errors.account}</div>}
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
            {errors.address && <div className="text-danger">{errors.address}</div>}
          </div>
          <div className="col-md-4">
            <label htmlFor="phoneNumber" className="form-label">Số điện thoại</label>
            <input
              type="text"
              className="form-control"
              id="PhoneNumber"
              name="PhoneNumber"
              value={PhoneNumber}
              onChange={this.handleInputChange}
              required
            />
            {errors.PhoneNumber && <div className="text-danger">{errors.PhoneNumber}</div>}
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
            {errors.department && <div className="text-danger">{errors.department}</div>}
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
              <option selected disabled value="">Choose...</option>
              <option value="male">Nam</option>
              <option value="female">Nữ</option>
              <option value="other">Khác</option>
            </select>
            {errors.sex && <div className="text-danger">{errors.sex}</div>}
          </div>
          <div className="col-md-4">
            <label htmlFor="yob" className="form-label">Ngày sinh</label>
            <input
              type="date"
              className="form-control"
              id="yob"
              name="yob"
              value={yob}
              onChange={this.handleInputChange}
              required
            />
            {errors.yob && <div className="text-danger">{errors.yob}</div>}
          </div>
          <div className="col-md-4">
            <label htmlFor="startDate" className="form-label">Ngày vào</label>
            <input
              type="date"
              className="form-control"
              id="startDate"
              name="startDate"
              value={startDate}
              onChange={this.handleInputChange}
              required
            />
            {errors.startDate && <div className="text-danger">{errors.startDate}</div>}
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
              <option selected disabled value="">Choose...</option>
              <option value="working">Đang làm việc</option>
              <option value="noWorking">Đã nghỉ việc</option>
            </select>
            {errors.employeeStatus && <div className="text-danger">{errors.employeeStatus}</div>}
          </div>
          <div className="col-md-4">
            <label htmlFor="user" className="form-label">User</label>
            <div className="position-relative">
                <input
                type="text"
                value={searchUser}
                name="user"
                onChange={this.handleUserSearchChange}
                placeholder="Nhập tên ..."
                className="form-control"
                />
                {errors.user && <div className="text-danger">{errors.user}</div>}

              {searchUser && userSearchResults.length > 0 && (
                <div className="position-absolute w-100 bg-white border rounded shadow-sm mt-1" style={{ zIndex: 1000 }}>
                  <ul 
                    className="list-group"
                    style={{
                      maxHeight: userSearchResults.length >= 4 ? '200px' : 'auto',  
                      overflowY: userSearchResults.length >= 4 ? 'auto' : 'unset',
                    }}
                  >
                    {userSearchResults.map((user) => (
                      <li key={user.Key} 
                          className="list-group-item list-group-item-action" 
                          onClick={() => this.handleUserSelect(user)}
                      >
                        <div className='d-flex align-items-center'>
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
          <div className="col-md-4">
            <label htmlFor="listUser" className="form-label">ListUser</label>
            <div className="position-relative">
                <input
                type="text"
                value={searchListUser}
                name="listUser"
                onChange={this.handleListUserSearchChange}
                placeholder="Nhập tên ..."
                className="form-control"
                />

                {errors.userListError && <div className="text-danger">{errors.userListError}</div>}

              {searchListUser && listUserSearchResults.length > 0 && (
                <div className="position-absolute w-100 bg-white border rounded shadow-sm mt-1" style={{ zIndex: 1000 }}>
                  <ul 
                    className="list-group"
                    style={{
                      maxHeight: listUserSearchResults.length >= 4 ? '200px' : 'auto',  
                      overflowY: listUserSearchResults.length >= 4 ? 'auto' : 'unset',
                    }}
                  >
                    {listUserSearchResults.map((user) => (
                      <li key={user.Key} 
                          className="list-group-item list-group-item-action" 
                          onClick={() => this.handleListUserSelect(user)}
                      >
                        <div className='d-flex align-items-center'>
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
            {selectedListUsers.length > 0 && (
              <div className="mt-3">
                <h6>Selected Users:</h6>
                <ul className="list-group">
                  {selectedListUsers.map(user => (
                    <li key={user.userId} className="list-group-item d-flex justify-content-between align-items-center">
                      {user.userName}
                      <button type="button" className="btn btn-danger btn-sm" onClick={() => this.handleRemoveSelectedUser(user.userId)}>
                        <i class="fa-solid fa-trash"></i>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="col-12">
            <button className="btn btn-primary" type="submit">Thêm mới</button>
          </div>
        </form>
      </div>
    );
  }
}
