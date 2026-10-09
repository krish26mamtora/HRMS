import React, { useState, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import api from '../auth/api/axios';

type TagsDisplayDto = {
  id: number;
  tagName: string;
};

type PostsCreateUpdateDto = {
  title: string;
  description: string;
  images: FileList | null;
  tagIds: number[]; 
};

const AddPost = () => {
  const navigate = useNavigate();
  const [tags, setTags] = useState<TagsDisplayDto[]>([]);
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  
  const [selectedImageFiles, setSelectedImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<PostsCreateUpdateDto>();

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await api.get<TagsDisplayDto[]>('/Posts/tags');
        setTags(response.data);
      } catch (err) {
        console.error("Failed to load tags", err);
      }
    };
    fetchTags();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setSelectedImageFiles(prev => [...prev, ...newFiles]);
      const newPreviews = newFiles.map(file => URL.createObjectURL(file));
      setImagePreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    setSelectedImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const toggleTag = (tagId: number) => {
    setSelectedTags(prev => 
      prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
    );
  };

  const onSubmit: SubmitHandler<PostsCreateUpdateDto> = async (data) => {
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('Title', data.title);
    formData.append('Description', data.description);

    selectedTags.forEach(id => formData.append('TagIds', id.toString()));

    selectedImageFiles.forEach(file => {
      formData.append('Images', file);
    });

    try {
      await api.post('/Posts/upsert/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert('Your Achievement is Uploaded.');
      const role = (localStorage.getItem('role') === "HR") ? 'hr' : (localStorage.getItem('role') === "Employee" ? "employee" : 'manager');
      navigate(`/${role}/social`);
    } catch (error) {
      console.error('Submission Error:', error);
      alert('Error creating post.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md mt-10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">New Achievement</h2>
        <button 
          onClick={() => navigate(-1)} 
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
        >
          Close
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Post Title</label>
          <input
            {...register('title', { required: 'Title is required' })}
            type="text"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter title"
          />
          {errors.title && <p className="text-red-600 text-xs mt-1">{errors.title.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            {...register('description', { required: 'A description is required' })}
            rows={4}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Tell everyone about it..."
          />
          {errors.description && <p className="text-red-600 text-xs mt-1">{errors.description.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Add Tags</label>
          <div className="flex flex-wrap gap-2">
            {tags.map(tag => (
              <button
                key={tag.id}
                type="button"
                onClick={() => toggleTag(tag.id)}
                className={`px-3 py-1 rounded-md text-sm font-medium border transition-all ${
                  selectedTags.includes(tag.id)
                    ? 'bg-blue-500 border-blue-700 text-white'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                #{tag.tagName}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Upload Images</label>
          <div className="flex flex-wrap gap-4">
            {imagePreviews.map((src, index) => (
              <div key={index} className="relative h-20 w-20 rounded-md overflow-hidden border border-gray-300 group">
                <img src={src} className="h-full w-full object-cover" alt="preview" />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
            
            <label className="h-20 w-20 flex flex-col items-center justify-center border border-dashed border-gray-400 rounded-md cursor-pointer hover:bg-gray-50 transition-all text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="text-[10px] mt-1 font-bold">Add Photo</span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          </div>
        </div>

        <div className="pt-2">
          <button type="submit" disabled={isSubmitting}className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 border border-blue-700 rounded transition-colors disabled:bg-gray-400" >
            {isSubmitting ? 'Publishing...' : 'Create Post'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddPost;