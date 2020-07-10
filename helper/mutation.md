mutation {
  addUser(firstName: "what ever", companyId: "1", age: 12){
    	id
    	firstName
    	age
    company{
      description
    }
  }
  
  deleteUser(userId: "12") 


  
  
}