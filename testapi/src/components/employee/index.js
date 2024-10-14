import { Component } from 'react';
import { config } from "../../environment";
import { sp } from "@pnp/sp";
import "@pnp/sp/site-users/web";
import "@pnp/sp/profiles";
import "@pnp/sp/webs";
import "@pnp/sp/lists/web";
import "@pnp/sp/items";
import EmployeeDetail from './employeeDetail';
import EmployeeFormAdd from './employeeFormAdd';
import EmployeeFormEdit from './employeeFormEdit';
import ApexChart from './apexChart';


export default class Employee extends Component {
  constructor(props) {
    super(props);
    sp.setup({ pageContext: { web: { absoluteUrl: config.url.API_URL } } });
    this.state = {
      listEmployees: [],
      filteredEmployees: [],
      userSearchResults: [],
      selectedEmployee: null,
      searchKeyword: '',
      searchDay: '',
      selectedStatus: '',
      isModalOpen: false,
      isModalFormAddOpen: false,
      isModalFormEditOpen: false,
      employeesPerPage: 5, 
      currentPage: 1,  
      totalEmployees: 0,
      sortBy:'name',
      sortOrder:'asc'
    };
  }

  async componentDidMount() {
    this.loadEmployees();
  }

  loadEmployees = async () => {
    const { searchKeyword, searchDay, selectedStatus,  employeesPerPage, currentPage, sortBy,  sortOrder } = this.state;

    let queryFilter = "";

    if (searchKeyword) {
      queryFilter += `substringof('${searchKeyword}', user/Title)`;
    }

    if (selectedStatus) {
      if (queryFilter) queryFilter += " and ";
      queryFilter += `employeeStatus eq '${selectedStatus}'`;
    }

    if (searchDay) {
      if (queryFilter) queryFilter += " and ";
      queryFilter += `startDate ge '${searchDay}'`;
    }



  try {
    const totalEmployees = await sp.web.lists.getByTitle("ListEmployees")
        .items.filter(queryFilter).get();
    const totalPages = Math.ceil(totalEmployees.length / employeesPerPage);

    const listEmployees = await sp.web.lists
      .getByTitle("ListEmployees")
      .items
      .select("Id", "name", "email", "account", "address", "PhoneNumber", "sex", "yob", "startDate", "department", "employeeStatus", "listUser/Title" ,"user/Title", "user/Name", "user/Id")
      .filter(queryFilter)
      .top(employeesPerPage)
      .skip((currentPage - 1) * employeesPerPage)
      .expand("user","listUser")
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
        ...e,
        user: user.UserName,
        userId: user.UserId,
        userEmail: user.UserEmail,
      };
    });

    this.setState({
      listEmployees: formattedEmployees,
      filteredEmployees: formattedEmployees,
      totalPages,
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

  handleInputChange = async (event) => {
  const searchKeyword = event.target.value;
  this.setState({ searchKeyword}, () => {
    if(searchKeyword === ''){
      this.loadEmployees();
    }
  });

  if (searchKeyword) {
      const userSearchResults = await this.searchPeoplePicker(searchKeyword);

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
    console.log(userInfo.UserTitle);

    this.setState(
    { 
      searchKeyword: userInfo.UserTitle, 
      userSearchResults: []         
    }, 
    () => {
      this.loadEmployees();
    }
  ); 
  };

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

  handleDayChange = (event) => {
    const searchDay = event.target.value;
    this.setState({ searchDay }, () => {
      this.loadEmployees(); 
    });
  };

  handleChangeStatus = (event) => {
    this.setState({ selectedStatus: event.target.value },() => {
      this.loadEmployees();
    });
  };

  handleClick = (employee) => {
    this.setState({ selectedEmployee: employee, isModalOpen: true });
  };

  handleEditEmployee = (employee) => {
    this.setState({selectedEmployee: employee, isModalFormEditOpen:true});
  }

  handleAddEmployee = () => {
    this.setState({ isModalFormAddOpen: true });
  };

  handleDelEmployee = async (employee) => {
    const isConfirmed = window.confirm(`Bạn có chắc chắn muốn xóa nhân viên '${employee.name}'?`);
    
    if (isConfirmed) {
      try {
        let list = sp.web.lists.getByTitle("ListEmployees");
        await list.items.getById(employee.Id).delete();

        alert('Nhân viên đã được xóa thành công!');
        this.loadEmployees(); 
      } catch (error) {
        console.error('Lỗi khi xóa nhân viên:', error);
        alert('Xóa nhân viên không thành công. Vui lòng thử lại.');
      }
    } else {
      alert('Xóa nhân viên đã bị hủy.');
    }
  };

  handlePageChange = (page) => {
    this.setState({ currentPage: page }, () => {
      this.loadEmployees();
    });
  };

  handleEmployeePerPageChange = (employeesPerPage) => {
    this.setState({ employeesPerPage, currentPage: 1 }, () => {
      this.loadEmployees();
    });
  };

  handleSort = (field) => {
    const { sortBy, sortOrder } = this.state;

    const newSortOrder = sortBy === field && sortOrder === 'asc' ? 'desc' : 'asc';
    this.setState({
        sortBy: field,
        sortOrder: newSortOrder
    }, () => {
        this.loadEmployees(); 
    });
  };

  closeModal = () => {
    this.setState({ 
      isModalOpen: false, 
      isModalFormAddOpen: false, 
      isModalFormEditOpen:false, 
      selectedEmployee: null });
  };

  formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  render() {
    const { 
      filteredEmployees, 
      selectedEmployee, 
      searchKeyword, 
      searchDay, 
      isModalOpen, 
      isModalFormAddOpen, 
      isModalFormEditOpen, 
      selectedStatus, 
      userSearchResults,
      currentPage,
      totalPages
    } = this.state;
    return (
      <div>
        <h2 className="text-center mt-4">Danh sách nhân viên</h2>

        <div className='px-5 mt-4 d-flex justify-content-between'>
          <div>
            <button type="button" className="btn btn-primary btn-sm" onClick={this.handleAddEmployee}>
              Thêm nhân viên
            </button>
          </div>
          <div className="d-flex">
            <div className="position-relative">
                <input
                    type="text"
                    value={searchKeyword}
                    onChange={this.handleInputChange}
                    placeholder="Nhập tên ..."
                    className="form-control"
                    style={{ width: '280px' }} 
                  />
                {searchKeyword && userSearchResults.length > 0 && (
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
                            style={{cursor:'pointer'}} 
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

            <div className="mx-2">
              <input
                type="date"
                value={searchDay}
                onChange={this.handleDayChange}
                placeholder="Nhập ngày vào ..."
                className="form-control"
              />
            </div>
            <div className="w-20" >
              <select
                className="form-select"
                style={{cursor:'pointer'}} 
                aria-label="Default select example"
                value={selectedStatus}
                onChange={this.handleChangeStatus}
              >
                <option value="">Chọn trạng thái</option>
                <option value="working">Đang làm việc</option>
                <option value="noWorking">Đã nghỉ việc</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bảng hiển thị ra nhân viên */}
        <ul className="mt-4">
          {filteredEmployees.length > 0 ? (
            <div>
              <table className="table">
                <thead>
                  <tr>
                    <th scope="col">ID</th>
                    <th scope="col">Tên
                      {/* <i className="fa-solid fa-sort ms-1 px-2" 
                      onClick={() => this.handleSort('name')}
                      style={{cursor:'pointer'}} ></i> */}
                    </th>
                    <th scope="col">Phòng/Ban</th>
                    <th scope="col">Ngày vào</th>
                    <th scope="col">Trạng thái nhân viên</th>
                    <th scope="col">User</th>
                    <th scope="col">ListUser</th>
                    <th scope="col">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map((employee,index) => (
                    
                    <tr key={employee.Id}>
                      <th scope="row">{index + 1}</th>
                      <td>{employee.name}</td>
                      <td>{employee.department}</td>
                      <td>{this.formatDate(employee.startDate)}</td>
                      <td>
                        <span style={{ padding: '4px 16px', borderRadius: '50px' }} 
                        className={employee.employeeStatus === 'working' ? 'bg-success text-light' : 'bg-danger text-light'}>
                          {employee.employeeStatus === "working" ? "Đang làm việc" : "Đã nghỉ việc"}
                        </span>
                      </td>
                      <td>{employee.user}</td>
                      <td>
                        {
                          employee.listUser ? (
                            employee.listUser.map((user, index) => (
                            <p key={index} className='m-0'>
                              {user.Title}
                            </p>
                          ))
                          ) : '' 
                        }
                        </td>
                      <td>
                        <button className="btn btn-primary btn-sm" onClick={() => this.handleClick(employee)}>
                          Chi tiết
                        </button>

                        <button className="btn btn-warning btn-sm ms-2" onClick={() => this.handleEditEmployee(employee)}>
                          Cập nhật
                        </button>

                        <button className="btn btn-danger btn-sm ms-2" onClick={() => this.handleDelEmployee(employee)}>
                          Xoá
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* panination */}
              <div className="d-flex justify-content-end">
                <nav aria-label="Page navigation example" style={{marginRight:20}} >
                  <ul className="pagination">
                    <li className={`page-item ${this.state.employeesPerPage === 5 ? 'active' : ''}`}>
                      <a className="page-link" href="#" onClick={() => this.handleEmployeePerPageChange(5)}>5</a>
                    </li>     
                    <li className={`page-item ${this.state.employeesPerPage === 10 ? 'active' : ''}`}>
                      <a className="page-link" href="#" onClick={() => this.handleEmployeePerPageChange(10)}>10</a>
                    </li>     
                    <li className={`page-item ${this.state.employeesPerPage === 15 ? 'active' : ''}`}>
                      <a className="page-link" href="#" onClick={() => this.handleEmployeePerPageChange(15)}>15</a>
                    </li>     
                  </ul>
                </nav>
                 <nav aria-label="Page navigation example" style={{ marginRight: 70 }}>
                  <ul className="pagination">
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                      <a className="page-link" href="#" onClick={() => this.handlePageChange(currentPage - 1)}>&laquo;</a>
                    </li>
                    {[...Array(totalPages)].map((page, index) => (
                      <li key={index} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
                        <a className="page-link" href="#" onClick={() => this.handlePageChange(index + 1)}>{index + 1}</a>
                      </li>
                    ))}
                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                      <a className="page-link" href="#" onClick={() => this.handlePageChange(currentPage + 1)}>&raquo;</a>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
          ) : (
            <div className="alert alert-warning" role="alert">
              Không tìm thấy nhân viên nào!
            </div>
          )}
        </ul>
        
        {/* popup hiển thị chi tiết nhân viên */}
        {isModalOpen && (
          <div className="modal show" tabIndex="-1" style={{ display: 'block' }}>
            <div className="modal-dialog " style={{ maxWidth: '1000px' }}>
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Thông tin nhân viên</h5>
                  <button type="button" className="btn-close" onClick={this.closeModal}></button>
                </div>
                <div className="modal-body">
                  <EmployeeDetail employee={selectedEmployee} />
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={this.closeModal}>Đóng</button>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* popup hiển form thêm nhân vien */}
        {isModalFormAddOpen && (
          <div className="modal show" tabIndex="-1" style={{ display: 'block' }}>
            <div className="modal-dialog " style={{ maxWidth: '1000px' }}>
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Thêm nhân viên mới</h5>
                  <button type="button" className="btn-close" onClick={this.closeModal}></button>
                </div>
                <div className="modal-body">
                  <EmployeeFormAdd onClose={this.closeModal} onReload = {this.loadEmployees} />
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={this.closeModal}>Đóng</button>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* popup hiển form cập nhật nhân vien */}
        {isModalFormEditOpen && (
          <div className="modal show" tabIndex="-1" style={{ display: 'block' }}>
            <div className="modal-dialog " style={{ maxWidth: '1000px' }}>
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Cập nhật nhân viên</h5>
                  <button type="button" className="btn-close" onClick={this.closeModal}></button>
                </div>
                <div className="modal-body">
                  <EmployeeFormEdit onClose={this.closeModal} onReload = {this.loadEmployees} employee={selectedEmployee} />
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={this.closeModal}>Đóng</button>
                </div>
              </div>
            </div>
          </div>
        )}

         <ApexChart />

      </div>
    );
  }
}
