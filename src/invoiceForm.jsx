import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as yup from 'yup';


const validationSchema = yup.object({
    invoice_number: yup
        .string()
        .matches(/^[A-Z]{2}\d{3}[A-Z]{1}$/, 'Invoice number must be in the format NN308E')
        .required('Invoice number is required'),
    customer_name: yup.string().required('Customer name is required'),
    date: yup.date().required('Date is required'),
});
function InvoiceManagement() {
    const [invoices, setInvoices] = useState([]);
    const [newInvoice, setNewInvoice] = useState("");
    const [newCustomer, setNewCustomer] = useState("");
    const [newDate, setNewDate] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [errors, setErrors] = useState({}); 
    const invoicesPerPage = 5;
    const [details, setDetails] = useState([]);
    const [currentDetail, setCurrentDetail] = useState({
        description: "",
        quantity: 1,
        unit_price: 0,
    });
    const [detailsVisibility, setDetailsVisibility] = useState({});

    // Fetch invoices from the backend
    useEffect(() => {
        axios.get("http://localhost:8000/api/invoices/")
            .then(response => setInvoices(response.data.results))
            .catch(error => console.error("Error fetching invoices:", error));
    }, [invoices]);

    useEffect(()=>{
    if(details.length>0)addData();
    },[details]);

    const addDetail = () => {
        if (currentDetail.description) {
            setDetails((prevDetails) => {
                const updatedDetails = [...prevDetails, currentDetail];
                console.log("Updated Details:", updatedDetails);
                return updatedDetails;
            });
            setCurrentDetail({ description: "", quantity: 1, unit_price: 0 });
        } else {
            alert("Please enter a description for the detail.");
        }
       
    };

   // Toggle details for a specific invoice
const toggleDetails = (invoiceId) => {
    setDetailsVisibility((prevState) => ({
        ...prevState,
        [invoiceId]: !prevState[invoiceId],
    }));
};
    const addData = async () => {
        try{
            await validationSchema.validate({ invoice_number: newInvoice, customer_name: newCustomer, date: newDate }, { abortEarly: false });

            // if (details.length === 0) {
            //     alert("Please add at least one detail.");
            //     return;
            // }
            if (newInvoice.trim() !== "" && newCustomer.trim() !== "" && newDate.trim() !== "") {

                const invoiceData = {
                    invoice_number: newInvoice,
                    customer_name: newCustomer,
                    date: newDate,
                    details: details.map((detail) => ({
                        description: detail.description,
                        quantity: detail.quantity,
                        unit_price: detail.unit_price,
                    })),
                };
                 
                try {
                    console.log(invoiceData);
                    const response = await axios.post("http://localhost:8000/api/invoices/", invoiceData);
                    details.forEach((detail) => console.log(detail.description));
                    // Handle success
                } catch (error) {
                    console.error("Error adding invoice:", error.response?.data || error.message);
                }
            



            // const invoiceData = {
            //     invoice_number: newInvoice,
            //     customer_name: newCustomer,
            //     date: newDate,
            //     details,
            // };
            // try {
            //     const response = await axios.post("http://localhost:8000/api/invoices/", invoiceData);

            //     if (response.status === 201) {
            //         setInvoices(prevInvoices => [...prevInvoices, response.data]);
            //         setNewInvoice("");
            //         setNewCustomer("");
            //         setNewDate("");
            //         setDetails([]);
            //         setErrors({});
            //     }
            // } catch (error) {
            //     console.error("Error adding invoice:", error);
            //     alert("Failed to add invoice. Please try again.");
            // }
        } else {
            alert("Please fill in all fields.");
        }
    } catch (validationErrors) {
        const errorMessages = validationErrors.inner.reduce((acc, error) => {
            acc[error.path] = error.message;
            return acc;
        }, {});
        setErrors(errorMessages);  // Set the errors state
           if (errorMessages.invoice_number) {
            
            alert("enter a correct invoice number format: NN308C"); 
    }
}
    };

    const deleteData = async (id) => {
        try {
            const response = await axios.delete(`http://localhost:8000/api/invoices/${id}/`);
            if (response.status === 204) {
                setInvoices(prevInvoices => prevInvoices.filter(invoice => invoice.id !== id));
            }
        } catch (error) {
            console.error("Error deleting invoice:", error);
            alert("Failed to delete invoice. Please try again.");
        }
    };


    const handleDetailChange = (e) => {
        setCurrentDetail({ ...currentDetail, [e.target.name]: e.target.value });
    };
    const handleInvoiceChange = e => setNewInvoice(e.target.value);
    const handleCustomerChange = e => setNewCustomer(e.target.value);
    const handleDateChange = e => setNewDate(e.target.value);

    const indexOfLastInvoice = currentPage * invoicesPerPage;
    const indexOfFirstInvoice = indexOfLastInvoice - invoicesPerPage;
    const currentInvoices = invoices.slice(indexOfFirstInvoice, indexOfLastInvoice);

    const totalPages = Math.ceil(invoices.length / invoicesPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);
    const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
    const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

    return (
        <div>
            <h1>Invoice Management</h1>
            <div className="invoice-input">
                <input
                    type="text"
                    placeholder="Enter Invoice Number..."
                    value={newInvoice}
                    onChange={handleInvoiceChange}
                />
                <input
                    type="text"
                    placeholder="Enter Customer Name..."
                    value={newCustomer}
                    onChange={handleCustomerChange}
                />
                <input
                    type="date"
                    placeholder="Enter Date..."
                    value={newDate}
                    onChange={handleDateChange}
                />
                </div>
                <div className="detail-input">
                    <h3>Invoice Details</h3>
                    <input
                        type="text"
                        name="description"
                        placeholder="Enter Description"
                        value={currentDetail.description}
                        onChange={(e) => {
                            const value = e.target.value;
                            setCurrentDetail({
                                ...currentDetail,
                                [e.target.name]: value === "" ? "" : value,
                            });
                        }}
                        
                    />
                    <input
                        
                        name="quantity"
                        placeholder="Enter Quantity"
                        value={currentDetail.quantity}
                        onChange={(e) => {
                            const value = e.target.value;
                            setCurrentDetail({
                                ...currentDetail,
                                [e.target.name]: value === "" ? "" : parseFloat(value),
                            });
                        }}
                        
                    />
                    <input
                        
                        name="unit_price"
                        placeholder="Enter Unit Price"
                        value={currentDetail.unit_price}
                        onChange={(e) => {
                            const value = e.target.value;
                            setCurrentDetail({
                                ...currentDetail,
                                [e.target.name]: value === "" ? "" : parseFloat(value),
                            });
                        }}
                        
                    />
                    </div>
                

                           
                    <button 
                      className="add" 
                      onClick={() => { 
                      addDetail(); 
    }}
>
    Submit
</button>

            

            <div className="header-row">
                <h3>Invoice Number</h3>
                <h3>Customer Name</h3>
                <h3>Date</h3>
            </div>
           <div className='list'>
            <ol>
                {currentInvoices.map(invoice => (
                    <li key={invoice.id} className="list-row">
                        <span className='invoice-item'>{invoice.invoice_number}</span>
                        <span  className='invoice-item'>{invoice.customer_name}</span>
                        <span className='invoice-item'>{invoice.date ? new Date(invoice.date).toLocaleDateString() : "No Date"}</span>
                        <button className="details-button" onClick={() => toggleDetails(invoice.id)}> Details</button>
                       {detailsVisibility[invoice.id] && (
                        <ol>
                           {invoice.details.map((detail, index) => (
                           <li key={index}>
                           <span>{detail.description}</span>
                           <span>{detail.quantity}</span>
                           <span>{detail.unit_price}</span>
            </li>
        ))}
    </ol>
)}
                        <button className="delete" onClick={() => deleteData(invoice.id)}>Delete</button>
                    </li>
                ))}
            </ol>
                </div>
            <div className="pagination-container">
                <button onClick={prevPage} disabled={currentPage === 1} className="pagination-button">
                    Previous
                </button>

                {Array.from({ length: totalPages }, (_, index) => (
                    <button
                        key={index}
                        onClick={() => paginate(index + 1)}
                        className={`pagination ${currentPage === index + 1 ? 'active' : ''}`}
                    >
                        {index + 1}
                    </button>
                ))}

                <button
                    onClick={nextPage}
                    disabled={currentPage === totalPages || invoices.length === 0}
                    className="pagination-button"
                >
                    Next
                </button>
            </div>
        </div>
    );
}

export default InvoiceManagement;
