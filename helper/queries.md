query userAndCompany{
  user(id: "2", name: "yes"){
    id
    firstName
    age
    company{
      name
      id
      description
    }
  }
  
  company1: companies(id: "2"){
    ...companyDetails
  }
  
  company2: companies(id:"2"){
  	...companyDetails
  }
}

fragment companyDetails on Company {
  id
    name
    description
    users{
      firstName
      age
    }
}
