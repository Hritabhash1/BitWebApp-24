import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ClipLoader from "react-spinners/ClipLoader";
import Swal from 'sweetalert2';

const HigherEducation = () => {
  const [higherEducations, setHigherEducations] = useState([]);
  const [institute, setInstitute] = useState('');
  const [degree, setDegree] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [field, setField] = useState('');
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [higherEducationId, setHigherEducationId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfigs, setSortConfigs] = useState([]);

  const fetchHigherEducations = async () => {
    try {
      const response = await axios.get('/api/v1/higher-education');
      setHigherEducations(response.data.data);
    } catch (error) {
      console.log(error.message);
    }
  };

  useEffect(() => {
    fetchHigherEducations();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const documentLinks = docs.map((doc, index) => {
      const url = URL.createObjectURL(doc);
      return `<a href="${url}" target="_blank" style="display: block; margin-top: 10px;">Document ${index + 1} (Click to View)</a>`;
    }).join('');

    const htmlContent = `
      <div style="text-align: left; padding: 20px;">
        <p style="font-size: 18px; margin: 10px 0; color: #333;">
          <strong>Institution:</strong> ${institute}
        </p>
        <p style="font-size: 18px; margin: 10px 0; color: #333;">
          <strong>Degree:</strong> ${degree}
        </p>
        <p style="font-size: 18px; margin: 10px 0; color: #333;">
          <strong>Field of Study:</strong> ${field}
        </p>
        <p style="font-size: 18px; margin: 10px 0; color: #333;">
          <strong>Start Date:</strong> ${startDate}
        </p>
        <p style="font-size: 18px; margin: 10px 0; color: #333;">
          <strong>End Date:</strong> ${endDate}
        </p>
        <p style="font-size: 18px; margin: 10px 0; color: #333;">
          <strong>Supporting Documents:</strong> ${documentLinks}
        </p>
        <br/>
      </div>
      <p style="font-size: 17px; color: #666;">
          Do you want to submit the form?
        </p>
    `;

    Swal.fire({
      title: 'Are you sure?',
      html: htmlContent,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, submit it!',
      cancelButtonText: 'No, cancel!',
      buttonsStyling: true,
      customClass: {
        confirmButton: 'btn btn-success',
        cancelButton: 'btn btn-danger'
      },
      showLoaderOnConfirm: true,
      preConfirm: async () => {
        setLoading(true);
        const formData = new FormData();
        formData.append('institution', institute);
        formData.append('degree', degree);
        formData.append('fieldOfStudy', field);
        formData.append('startDate', startDate);
        formData.append('endDate', endDate);
        Array.from(docs).forEach((doc) => {
          formData.append('files', doc);
        });

        try {
          if (higherEducationId) {
            await axios.put(`/api/v1/higher-education/${higherEducationId}`, formData);
            toast.success('Higher education updated successfully!');
          } else {
            await axios.post('/api/v1/higher-education', formData);
            toast.success('Higher education created successfully!');
          }
          fetchHigherEducations();
          setInstitute('');
          setDegree('');
          setField('');
          setStartDate('');
          setEndDate('');
          setDocs([]);
          setHigherEducationId('');
          Swal.fire(
            'Submitted!',
            'Your form has been submitted.',
            'success'
          );
        } catch (error) {
          toast.error('An error occurred while saving higher education');
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const handleFileChange = (e) => {
    const files = e.target.files;
    const newDocs = Array.from(files);
    setDocs([...docs, ...newDocs]);
  };

  const handleSortOptionChange = async (field, e) => {
    const direction = e.target.value;
    const newConfig = direction === 'Sort By' ? null : { field, direction };
    await setSortConfigs((prevConfigs) => {
      const otherConfigs = prevConfigs.filter(config => config.field !== field);
      return newConfig ? [...otherConfigs, newConfig] : otherConfigs;
    });
  };

  const getSortDirection = (field) => {
    const config = sortConfigs.find(config => config.field === field);
    return config ? config.direction : 'Sort By';
  };

  const sortHigherEducations = (higherEducations, configs) => {
    return higherEducations.sort((a, b) => {
      for (const config of configs) {
        const { field, direction } = config;
        let comparison = 0;
        if (typeof a[field] === 'string' && typeof b[field] === 'string') {
          comparison = a[field].localeCompare(b[field]);
        } else {
          comparison = a[field] > b[field] ? 1 : (a[field] < b[field] ? -1 : 0);
        }
        if (direction === 'descending') comparison *= -1;
        if (comparison !== 0) return comparison;
      }
      return 0;
    });
  };

  const sortedHigherEducations = sortHigherEducations([...higherEducations], sortConfigs);

  const filteredHigherEducations = sortedHigherEducations.filter((higherEducation) =>
    Object.values(higherEducation).some((value) =>
      typeof value === 'string' ?
      value.toLowerCase().includes(searchQuery.toLowerCase()) :
      value.toString().includes(searchQuery)
    )
  );

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { day: '2-digit', month: 'short', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center">
      <ToastContainer />
      <div className="w-full flex flex-col p-6 justify-between">
        <div className="w-full flex flex-col">
          <div className="flex flex-col w-full mb-5">
            <h3 className="text-3xl font-semibold mb-4">Higher Education</h3>
            <p className="text-base mb-2">Enter Your details.</p>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="w-full flex flex-col">
              <label>Institute</label>
              <input
                type="text"
                placeholder="Enter Institute"
                value={institute}
                onChange={(e) => setInstitute(e.target.value)}
                className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none focus:outline-none"
                required
              />
              <label>Degree</label>
              <input
                type="text"
                placeholder="Enter Degree"
                value={degree}
                onChange={(e) => setDegree(e.target.value)}
                className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none focus:outline-none"
                required
              />
              <label>Field of Study</label>
              <input
                type="text"
                placeholder="Enter Field of Study"
                value={field}
                onChange={(e) => setField(e.target.value)}
                className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none focus:outline-none"
                required
              />
              <label>Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none focus:outline-none"
                required
              />
              <label>End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none focus:outline-none"
                required
              />
              <label>Upload Supporting Documents</label>
              <input
                type="file"
                onChange={handleFileChange}
                multiple
                className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none focus:outline-none"
              />
              <button
                type="submit"
                className={loading ? "bg-black text-white w-full rounded-md p-4 text-center flex items-center opacity-70 justify-center my-2 hover:bg-black/90" : "bg-black text-white w-full rounded-md p-4 text-center flex items-center justify-center my-2 hover:bg-black/90"}
              >
                {loading ? <ClipLoader color="gray" /> : higherEducationId ? 'Update' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      </div>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4 text-center">Existing Higher Education</h1>
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="mb-4 px-4 py-2 border rounded w-full"
        />
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Institute
                  <div>
                    <select value={getSortDirection('institution') || ''} onChange={(e) => handleSortOptionChange('institution', e)}>
                      <option value="Sort By">Sort By</option>
                      <option value="ascending">Ascending</option>
                      <option value="descending">Descending</option>
                    </select>
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Degree
                  <div>
                    <select value={getSortDirection('degree') || ''} onChange={(e) => handleSortOptionChange('degree', e)}>
                      <option value="Sort By">Sort By</option>
                      <option value="ascending">Ascending</option>
                      <option value="descending">Descending</option>
                    </select>
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Field of Study
                  <div>
                    <select value={getSortDirection('fieldOfStudy') || ''} onChange={(e) => handleSortOptionChange('fieldOfStudy', e)}>
                      <option value="Sort By">Sort By</option>
                      <option value="ascending">Ascending</option>
                      <option value="descending">Descending</option>
                    </select>
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Start Date
                  <div>
                    <select value={getSortDirection('startDate') || ''} onChange={(e) => handleSortOptionChange('startDate', e)}>
                      <option value="Sort By">Sort By</option>
                      <option value="ascending">Ascending</option>
                      <option value="descending">Descending</option>
                    </select>
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  End Date
                  <div>
                    <select value={getSortDirection('endDate') || ''} onChange={(e) => handleSortOptionChange('endDate', e)}>
                      <option value="Sort By">Sort By</option>
                      <option value="ascending">Ascending</option>
                      <option value="descending">Descending</option>
                    </select>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredHigherEducations.map((higherEducation) => (
                <tr key={higherEducation.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{higherEducation.institution}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{higherEducation.degree}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{higherEducation.fieldOfStudy}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{formatDate(higherEducation.startDate)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{formatDate(higherEducation.endDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HigherEducation;
