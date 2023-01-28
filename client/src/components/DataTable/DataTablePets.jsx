import React from "react";
import { DataGrid } from '@mui/x-data-grid';
import { Avatar } from '@mui/material';
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState} from 'react';
import { getAllPets } from "../../redux/slices/petsSlice";





const columns = [
  { field: 'image',
  headerName: 'Imagen',
  width: 70,
  renderCell: (params) => (
    <Avatar src={params.row.image} variant="rounded" />
  ),
  sortable: false,
  filterable: false,
},
  { field: 'id',
    headerName: 'ID', 
    width: 300 },

  { field: 'name',
    headerName: 'Nombre',
    width: 100 },

  { field: 'species',
    headerName: 'Especie',
    type: 'singleSelect',
    valueOptions: ['feline', 'female', 'fish',  'rodent','equine', 'bovine', 'ovine', 'goat','other'],
     width: 100 },
  {
    field: 'age',
    headerName: 'Edad',
    type: 'number',
    width: 50,
  },
  {
    field: 'ageTime',
    headerName: 'meses / años',
    type: 'singleSelect',
    valueOptions: ['months', 'years'],
    width: 100,
  },

  {
    field: 'weight',
    headerName: 'Peso',
    type: 'number',
    width: 50,
  },
  { field: 'size',
    headerName: 'Tamaño',
    type: 'singleSelect',
    valueOptions: ['small', 'medium', 'big'],
    width: 90 
  },
  { field: 'gender',
    headerName: 'Género',
    type: 'singleSelect',
    valueOptions: ['male', 'female'],
    width: 100 
  },
    { field: 'breed',
    headerName: 'Raza',
    width:100 
  },
    { field: 'description',
    headerName: 'Descripción',
    width: 100 
  },
  {
    field: 'postDate',
    headerName: 'Publicado',
    width: 200,

    },
    { field: 'IsAdopted',
    headerName: 'Adoptado',
    type: 'boolean',
    width: 90 },
   
  ];
export default function DataTablePets() {

  // const dispatch = useDispatch()
  // const allPets = useSelector((state)=>state.pets)
  const [tableData, setTableData] = useState([])


  useEffect(() => {
    fetch("http://localhost:3001/animals")
      .then((data) => data.json())
      .then((data) => setTableData(data))
  }, [])

  // {
  //   field: 'fullName',
  //   headerName: 'Full name',
  //   description: 'This column has a value getter and is not sortable.',
  //   sortable: false,
  //   width: 160,
  //   valueGetter: (params) =>
  //     `${params.row.firstName || ''} ${params.row.lastName || ''}`,
  // },

  




// const rows = [
// {
//   id: "1",
//     date: "1-Jan-2023",
//     species: "Dog",
//     name: "Rex",
//     age: 2,
//     weight: 25,
//     size: "Big",
//     genre: "Male",
//     breed: "Cacri",
//     description: "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Architecto sit fugiat",
//     img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQxZJlbDtw4byJKcug1ME7qlpG1jet3tHg1zA&usqp=CAU"},
//     {
//       id: "2",
//       date: "6-Jan-2023",
//       species: "Dog",
//       name: "princess",
//       age: 8,
//       weight: 10,
//       size: "medium",
//       genre: "female",
//       breed: "Spaniel",
//       description: "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Architecto sit fugiat",
//       img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTiEwsd1j4JLO9RoDf1e5DJOyRzJ6MHHC-sHpoD-i0DFjiQER8KvxTD7ZAbAQiKnOEpB4c&usqp=CAU"
//     },



  // { id: 1, lastName: 'Snow', firstName: 'Jon', age: 35 },
  // { id: 2, lastName: 'Lannister', firstName: 'Cersei', age: 42 },
  // { id: 3, lastName: 'Lannister', firstName: 'Jaime', age: 45 },
  // { id: 4, lastName: 'Stark', firstName: 'Arya', age: 16 },
  // { id: 5, lastName: 'Targaryen', firstName: 'Daenerys', age: null },
  // { id: 6, lastName: 'Melisandre', firstName: null, age: 150 },
  // { id: 7, lastName: 'Clifford', firstName: 'Ferrara', age: 44 },
  // { id: 8, lastName: 'Frances', firstName: 'Rossini', age: 36 },
  // { id: 9, lastName: 'Roxie', firstName: 'Harvey', age: 65 },


//];





  

  //  useEffect(()=>{
  //   dispatch(getAllPets());
  //  },[])



  return (
    <div style={{ height: 400, width: '100%' }}>
      <DataGrid
        rows={tableData}
        columns={columns}
        pageSize={5}
        rowsPerPageOptions={[5]}
        checkboxSelection
      />
    </div>
  );
}
