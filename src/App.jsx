import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { createBrowserRouter, createRoutesFromElements, Route, Outlet, RouterProvider} from 'react-router-dom';
import NavBar from './components/NavBar';
import Home from './pages/Home';
import Menu from './pages/Menu';
import ShoppingCart from './pages/ShoppingCart';
import Login from './pages/Login';
import Admin from './pages/Admin';
import ProtectedRoute from './pages/ProtectedRoute';
import AddItem from './pages/AddItem';
import Register from './pages/Register';
import { disableReactDevTools } from '@fvilers/disable-react-devtools';
const apiUrl = process.env.REACT_APP_API_URL;
if(process.env.NODE_ENV==='production')
    disableReactDevTools();
const App = () => {
    const [Products,SetProducts]=useState([]);  
    const [user,Setuser]=useState(null); 
    function addToCart(prod){
        let NewProducts=[...Products];
        let idx=NewProducts.findIndex(product=>(product===prod));
        let added= NewProducts[idx].added;
        added?added=0:added=1;
        NewProducts[idx].added=added;
        if(added)
            NewProducts[idx].count=1;
        else
            NewProducts[idx].count=0;
        SetProducts(NewProducts);
    }
    function IncHandler(prod){
        let NewProducts=[...Products];
        let idx=NewProducts.findIndex(product=>(product===prod));
        let cnt=NewProducts[idx].count;
        NewProducts[idx].count=cnt+1;
        SetProducts(NewProducts);
    }
    function DeleteHandler(prod){
        let NewProducts=[...Products];
        let idx=NewProducts.findIndex(product=>(product===prod));
        NewProducts[idx].count=0;
        NewProducts[idx].added=0;
        SetProducts(NewProducts);    }
    function ResetHandler(){
        let NewProducts=[...Products];
        for(let i in NewProducts)
            NewProducts[i].count=0;
        SetProducts(NewProducts);
    }
    function getCount(){
        let cnt=0;
        for(let i in Products)
           if(Products[i].count)
            cnt++;
        return cnt;
    }
    useEffect(()=>{
        fetchData();
        GetUser();
    },[])
    async function fetchData(){
        const {data}= await axios.get(`${apiUrl}/api/menu`);
        SetProducts(data);
    }
    async function Remove(prod){
        try{
        await axios.delete(`${apiUrl}/user/admin`,{
            params:
            {id:prod.id},
        })
        // fetching updated data
        const {data}= await axios.get(`${apiUrl}/api/menu`);
        SetProducts(data);
    }
    catch(err){
        console.log(err);
    }
    }
    async function GetUser(){
        let {data}= await axios.get(`${apiUrl}/user/admin`,{
            withCredentials: true
        });
        if(data.isAdmin==='false')
            data.isAdmin=false;
        else if(data.isAdmin)
            data.isAdmin=true;
        Setuser(data);
    }
    const router=createBrowserRouter(
        createRoutesFromElements(
            <Route path='/' element={
            <Layout/>}>
            <Route index element={<Home user={user}/>}/>
            <Route path='/Menu' element={<Menu Products={Products} cart={addToCart}/>}/>
            <Route path='/login' element={<Login fetch={GetUser}/>}/>
            <Route path='/Register' element={<Register/>}/>
            <Route path='/Admin' element={<ProtectedRoute user={user}><Admin Products={Products} Rem={Remove} /></ProtectedRoute>}/>
            <Route path='/AddItem' element={<ProtectedRoute user={user}><AddItem fetch={fetchData}/></ProtectedRoute>}/>
            <Route path='/ShoppingCart' element={<ShoppingCart Products={Products} onDelete={DeleteHandler} onInc={IncHandler} onReset={ResetHandler}/>}/>
            </Route>
        )
    )
    
    function Layout(){
        return(
            <>
            <NavBar count={getCount()} user={user}/>
            <Outlet/>
            </>
        )
    }
    return ( 
        <RouterProvider router={router}/>
 );
}
 
export default App;