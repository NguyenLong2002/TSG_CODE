import './form.css';
import { useState, useRef } from 'react';

function Form() {
    const storageEmployees = JSON.parse(localStorage.getItem('employees'))
    const inputRef = useRef();
    const [formData, setFormData] = useState({
        employeeCode: '',
        employeeAccount: '',
        nationality: '',
        nation: '',
        maritalStatus: '',
        employeeName: '',
        dob: '',
        sex: '',
        religion: '',
        cmnd: ''
    });

    const [dataLists, setDataLists] = useState(storageEmployees ?? []);
    const [errorMessage, setErrorMessage] = useState('');
    const [editIndex,setEditIndex] = useState(null)

    const isFormValid = () => {
        if (!formData.employeeCode || !formData.employeeName || !formData.dob) {
            setErrorMessage('Vui lòng nhập đầy đủ thông tin!');
            return false;
        }
        setErrorMessage('');
        return true;
    };

    const handleInput = (e) => {
        setFormData({
            ...formData,
            [e.target.id]: e.target.value
        });
    };

    const handleSubmit = () => {
        if (isFormValid()) {
            const submittedData = {
                ...formData,
                nationality: formData.nationality || "vietnam",
                nation: formData.nation || "kinh",
                maritalStatus: formData.maritalStatus || "single",
                sex: formData.sex || "male"
            };
            if(editIndex !== null){
                const updateDataLists = [...dataLists]
                updateDataLists[editIndex] = submittedData
                setDataLists(updateDataLists)
                localStorage.setItem('employees', JSON.stringify(updateDataLists))
                setEditIndex(null)
            }else{
               setDataLists(prevDataLists => {
                const newDataLists = [...dataLists, submittedData];
                localStorage.setItem('employees', JSON.stringify(newDataLists))
                return newDataLists;
             }) 
            }
           
            setFormData({
                employeeCode: '',
                employeeAccount: '',
                nationality: '',
                nation: '',
                maritalStatus: '',
                employeeName: '',
                dob: '',
                sex: '',
                religion: '',
                cmnd: ''
            });
            inputRef.current.focus(); 
        }
    };

    const handleRemove = (index) => {
        const newDataLists = [...dataLists];
        newDataLists.splice(index, 1);
         localStorage.setItem('employees', JSON.stringify(newDataLists)); 
        setDataLists(newDataLists);
    };

    const handleEdit = (index) => {
      const dataToEdit = dataLists[index]
      setFormData(dataToEdit)
      setEditIndex(index)
    }

    const formatDate = (dateString) => {
        const date = new Date(dateString)
        const day = String(date.getDate()).padStart(2,'0')
        const month = String(date.getMonth() + 1).padStart(2,'0')
        const year = String(date.getFullYear())
        return `${day}-${month}-${year}`
    };
    return (
        <div>
            <h1>Thông tin chung</h1>
            <div className="employeeInfo">
                <div id="form">
                    <div className="box">
                        <label htmlFor="employeeCode">Mã nhân viên</label><br/>
                        <input 
                            id="employeeCode"
                            ref={inputRef}
                            value={formData.employeeCode}
                            onChange={handleInput}
                            placeholder="000051/2024/NV-TSG"
                        /><br/>

                        <label htmlFor="employeeAccount">Tài khoản nhân viên</label><br/>
                        <input 
                            id="employeeAccount"
                            value={formData.employeeAccount}
                            onChange={handleInput}
                            placeholder="Tìm kiếm người dùng"
                        /><br/>

                        <label htmlFor="nationality">Quốc tịch <span>*</span></label><br/>
                        <select 
                            name="nationality" 
                            id="nationality"
                            value={formData.nationality}
                            onChange={handleInput}>
                            <option value="vietnam">Việt Nam</option>
                            <option value="usa">Mỹ</option>
                            <option value="england">Anh</option>
                        </select><br/>

                        <label htmlFor="nation">Dân tộc</label><br/>
                        <select 
                            name="nation" 
                            id="nation"
                            value={formData.nation}
                            onChange={handleInput}>
                            <option value="kinh">Kinh</option>
                            <option value="homong">Hơ Mông</option>
                        </select>

                        <label htmlFor="maritalStatus">Tình trạng hôn nhân</label><br/>
                        <select 
                            name="maritalStatus" 
                            id="maritalStatus"
                            value={formData.maritalStatus}
                            onChange={handleInput}>
                            <option value="single">Độc thân</option>
                            <option value="married">Đã kết hôn</option>
                        </select>
                    </div>

                    <div className="box">
                        <label htmlFor="employeeName">Họ tên nhân viên <span>*</span></label><br/>
                        <input 
                            id="employeeName"
                            value={formData.employeeName}
                            onChange={handleInput}
                            placeholder="Nguyen Van A"
                        /><br/>

                        <label htmlFor="dob">Ngày sinh <span>*</span></label><br/>
                        <input 
                            id="dob"
                            type="date"
                            value={formData.dob}
                            onChange={handleInput}
                        /><br/>

                        <label htmlFor="sex">Giới tính <span>*</span></label><br/>
                        <select 
                            name="sex" 
                            id="sex"
                            value={formData.sex}
                            onChange={handleInput}>
                            <option value="">-- Lựa chọn --</option>
                            <option value="male">Nam</option>
                            <option value="female">Nữ</option>
                            <option value="other">Khác</option>
                        </select><br/>

                        <label htmlFor="religion">Tôn giáo</label><br/>
                        <input 
                            id="religion"
                            value={formData.religion}
                            onChange={handleInput}
                            placeholder="Không"
                        /><br/>

                        <label htmlFor="cmnd">Số CMND/CCND</label><br/>
                        <input 
                            type="number"
                            value={formData.cmnd}
                            onChange={handleInput}
                            id="cmnd"
                        /><br/>
                    </div>

                    {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
                    <button className="submitBtn" onClick={handleSubmit}>Submit</button>
                </div>
                
                <ul className="dataLists" style={{ display: dataLists.length > 0 ? 'block' : 'none' }}>
                    {dataLists.map((data, index) => (
                        <li key={index}>
                            <strong>Mã nhân viên:</strong> {data.employeeCode}<br/> 
                            <strong>Tài khoản nhân viên:</strong> {data.employeeAccount}<br/> 
                            <strong>Quốc tịch:</strong> {data.nationality}<br/> 
                            <strong>Dân tộc:</strong> {data.nation}<br/> 
                            <strong>Tình trạng hôn nhân:</strong> {data.maritalStatus}<br/> 
                            <strong>Họ tên:</strong> {data.employeeName}<br/> 
                            <strong>Ngày sinh:</strong> {formatDate(data.dob)}<br/> 
                            <strong>Giới tính:</strong> {data.sex}<br/> 
                            <strong>Tôn giáo:</strong> {data.religion}<br/> 
                            <strong>Số CMND/ CCND:</strong> {data.cmnd}<br/> 
                            <button className="DelBtn  Btn" onClick={() => handleRemove(index)}>Xoá nhân viên</button>
                            <button className="EditBtn Btn" onClick={() => handleEdit(index)}>Cập nhật nhân viên</button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default Form;
