'use client'
import { useState, useEffect } from "react";
import ImageUploader from "./ImageUploader";
import ProductManager from "./ProductManager";
import ServiceManager from "./ServiceManager";
import VideoUploader from "./VideoUploader";
import AdminSocial from "./AdminSocial";
import AdminPostsPage from "./Posts";


export default function AdminPage() {

  return (
    <div className="">
      <h1 className="text-4xl font-bold mb-10 text-center">Admin Dashboard</h1>
      <AdminPostsPage/>
      <ImageUploader/>
      <VideoUploader></VideoUploader>
      <ProductManager/>
      <ServiceManager/>
      <AdminSocial/>
    </div>
  );
}
