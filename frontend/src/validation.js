export const LIMITS = Object.freeze({email:254,password:128,title:120,description:2000,category:50,search:200});
const text = value => typeof value === 'string' ? value : '';
export const isMongoId = value => typeof value === 'string' && /^[a-f\d]{24}$/i.test(value);
export function validateAuth(values,{register=false}={}) {
  const email=text(values.email).trim();
  const password=text(values.password);
  const errors={};
  if(!email) errors.email='Email is required.';
  else if(email.length>LIMITS.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email='Enter a valid email address.';
  if(!password.trim()) errors.password='Password is required.';
  else if(password.length>LIMITS.password) errors.password='Password must not exceed 128 characters.';
  else if(register && !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[\s\S]{8,128}$/.test(password)) errors.password='Use 8–128 characters with uppercase, lowercase and a number.';
  if(register && !['client','freelancer'].includes(values.role)) errors.role='Choose Client or Freelancer.';
  return {errors,values:{email,password,...(register?{role:values.role}:{})}};
}
export function validateGig(values) {
  const title=text(values.title).trim();
  const description=text(values.description).trim();
  const category=text(values.category).trim();
  const rawPrice=text(values.price).trim();
  const errors={};
  if(!title) errors.title='Title is required.';
  else if(title.length>LIMITS.title) errors.title='Title must not exceed 120 characters.';
  if(!description) errors.description='Description is required.';
  else if(description.length>LIMITS.description) errors.description='Description must not exceed 2000 characters.';
  if(category.length>LIMITS.category) errors.category='Category must not exceed 50 characters.';
  if(!rawPrice) errors.price='Price is required.';
  else if(!/^\d+(?:\.\d{1,2})?$/.test(rawPrice) || !Number.isFinite(Number(rawPrice)) || !Number.isSafeInteger(Math.round(Number(rawPrice)*100))) errors.price='Enter a non-negative price with at most two decimal places.';
  return {errors,values:{title,description,category,price:Number(rawPrice)}};
}
export function focusFirstInvalid(form,errors) {
  const first=Object.keys(errors)[0];
  form.elements.namedItem(first)?.focus();
}
export function readCollection(data,key) {
  const collection=data?.[key];
  if(!Array.isArray(collection) || collection.some(item=>!item || typeof item!=='object' || typeof item._id!=='string' || !item._id)) throw new Error('The API returned incomplete page data. Please try again.');
  if(key==='gigs' && collection.some(item=>typeof item.title!=='string'||typeof item.description!=='string'||typeof item.price!=='number'||!Number.isFinite(item.price)||item.price<0)) throw new Error('The API returned invalid gig data. Please try again.');
  if(key==='users' && collection.some(item=>typeof item.email!=='string'||typeof item.role!=='string')) throw new Error('The API returned invalid user data. Please try again.');
  if((key==='bookings'||key==='transactions') && collection.some(item=>typeof item.amount!=='number'||!Number.isFinite(item.amount)||item.amount<0||typeof item.status!=='string')) throw new Error('The API returned invalid booking data. Please try again.');
  return collection;
}
export function readIncome(data) {
  if(!data || typeof data.totalIncome!=='number'||!Number.isFinite(data.totalIncome)||data.totalIncome<0||!Number.isSafeInteger(data.completedBookings)||data.completedBookings<0) throw new Error('The API returned invalid income data. Please try again.');
  return data;
}
export function readGig(data) {
  const gig=data?.gig;
  readCollection({gigs: gig?[gig]:null},'gigs');
  if(!isMongoId(gig._id)||typeof gig.isActive!=='boolean'||!gig.freelancer) throw new Error('The API returned incomplete service data. Please try again.');
  return gig;
}
