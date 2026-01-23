export const orgChartData = [
  {
    type: "person",
    expanded: true,
    data: {
      motherUnit: "Chief of Hospital",
      name: "Dave Anthony A. Vergara, MD",
      role: "Medical Center Chief I",
      borderColor: "yellow",
      employmentType: "Plantilla",
      aligned: true,
      employeeId: "RMBGH-00001",
      image: `https://cdn3.iconfinder.com/data/icons/avatars-flat/33/man_5-1024.png`,
    },
    children: [
      // Medical Director
      {
        type: "person",
        expanded: true,
        data: {
          motherUnit: "Medical Director",
          name: "Mario Victor M. Villardo, MD",
          role: "Medical Director",
          borderColor: "blue",
          employmentType: "Plantilla",
          aligned: true,
          employeeId: "RMBGH-0133566",
          image: `https://cdn3.iconfinder.com/data/icons/avatars-flat/33/man_5-1024.png`,
        },
        children: [
          {
            type: "person",
            expanded: true,
            data: {
              motherUnit: "Medical Services",
              name: "Clodoaido M. Caringal, MD",
              role: "Assistant Director for Medical Services",
              borderColor: "pink",
              employmentType: "Plantilla",
              aligned: true,
              employeeId: "RMBGH-00003",
              image: `https://cdn3.iconfinder.com/data/icons/avatars-flat/33/man_5-1024.png`,
            },
            children: [
              // Green nodes under Doc Caringal
              {
                type: "person",
                expanded: true,
                data: {
                  motherUnit: "Outpatient Department",
                  name: "Sabina L. Mendoza, MD",
                  role: "Head, Outpatient Department",
                  borderColor: "brown",
                  employmentType: "Plantilla",
                  aligned: true,
                  employeeId: "RMBGH-MS-001",
                  image: `https://cdn2.iconfinder.com/data/icons/business-finance-ii-flat/2048/Business_Woman-4096.png`,
                },
                children: [
                  {
                    type: "person",
                    expanded: true,
                    data: {
                      motherUnit: "Internal Medicine",
                      name: "Cristela V. Venegas, MD",
                      role: "Officer-in-Charge, Internal Medicine",
                      borderColor: "brown",
                      employmentType: "Plantilla",
                      aligned: true,
                      employeeId: "RMBGH-MS-002",
                      image: `https://cdn2.iconfinder.com/data/icons/business-finance-ii-flat/2048/Business_Woman-4096.png`,
                    },
                    children: [
                      {
                        type: "person",
                        expanded: true,
                        data: {
                          motherUnit: "Family Medicine",
                          name: "Robert B. Belleza, MD",
                          role: "Head, Family Medicine",
                          borderColor: "brown",
                          employmentType: "Plantilla",
                          aligned: true,
                          employeeId: "RMBGH-MS-003",
                          image: `https://cdn3.iconfinder.com/data/icons/avatars-flat/33/man_5-1024.png`,
                        },
                        children: [
                          {
                            type: "person",
                            expanded: true,
                            data: {
                              motherUnit: "Pediatrics",
                              name: "Joanne Raquel R. Teodoro, MD",
                              role: "Head, Pediatrics",
                              borderColor: "brown",
                              employmentType: "Plantilla",
                              aligned: true,
                              employeeId: "RMBGH-MS-004",
                              image: `https://cdn2.iconfinder.com/data/icons/business-finance-ii-flat/2048/Business_Woman-4096.png`,
                            },
                            children: [
                              {
                                type: "person",
                                expanded: true,
                                data: {
                                  motherUnit: "Hemodialysis",
                                  name: "Aina Duque, MD",
                                  role: "Head, Hemodialysis",
                                  borderColor: "brown",
                                  employmentType: "Plantilla",
                                  aligned: true,
                                  employeeId: "RMBGH-MS-005",
                                  image: `https://cdn2.iconfinder.com/data/icons/avatars-flat/33/woman_5-1024.png`,
                                },
                                children: [
                                  {
                                    type: "person",
                                    expanded: true,
                                    data: {
                                      motherUnit: "NICU",
                                      name: "Adelusa De Guzman-Besin, MD",
                                      role: "NICU",
                                      borderColor: "brown",
                                      employmentType: "Plantilla",
                                      aligned: true,
                                      employeeId: "RMBGH-MS-006",
                                      image: `https://cdn2.iconfinder.com/data/icons/avatars-flat/33/woman_5-1024.png`,
                                    },
                                    children: [
                                      {
                                        type: "person",
                                        expanded: true,
                                        data: {
                                          motherUnit: "PICU",
                                          name: "Samantha Imperial, MD",
                                          role: "PICU",
                                          borderColor: "brown",
                                          employmentType: "Plantilla",
                                          aligned: true,
                                          employeeId: "RMBGH-MS-007",
                                          image: `https://cdn2.iconfinder.com/data/icons/avatars-flat/33/woman_5-1024.png`,
                                        },
                                        children: [
                                          {
                                            type: "person",
                                            expanded: true,
                                            data: {
                                              motherUnit: "IMCU / MICU",
                                              name: "Mario Victor M. Villardo, MD",
                                              role: "Head, IMCU & MICU",
                                              borderColor: "brown",
                                              employmentType: "Plantilla",
                                              aligned: true,
                                              employeeId: "RMBGH-MS-008",
                                              image: `https://cdn3.iconfinder.com/data/icons/avatars-flat/33/man_5-1024.png`,
                                            },
                                            children: [],
                                          },
                                        ],
                                      },
                                    ],
                                  },
                                ],
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
          // Surgical Services under Medical Director with 6 green children

          {
            type: "person",
            expanded: true,
            data: {
              motherUnit: "Surgical Services",
              name: "Rashida Cawiya C. Guiling-Decena, MD",
              role: "Assistant Director",
              borderColor: "pink",
              employmentType: "Plantilla",
              aligned: true,
              employeeId: "RMBGH-00004",
              image: `https://cdn2.iconfinder.com/data/icons/business-finance-ii-flat/2048/Business_Woman-4096.png`,
            },
            children: [
              {
                type: "person",
                expanded: true,
                data: {
                  motherUnit: "Surgery",
                  name: "Rashida Cawiya C. Guiling-Decena, MD",
                  role: "Head",
                  borderColor: "brown",
                  employmentType: "Plantilla",
                  employeeId: "RMBGH-RG-001",
                  image: `https://cdn2.iconfinder.com/data/icons/business-finance-ii-flat/2048/Business_Woman-4096.png`,
                },
                children: [
                  {
                    type: "person",
                    expanded: true,
                    data: {
                      motherUnit: "Obstetrics & Gynecology",
                      name: "Anna Liza C. Salita, MD",
                      role: "Head",
                      borderColor: "brown",
                      employmentType: "Plantilla",
                      employeeId: "RMBGH-RG-002",
                      image: `https://cdn2.iconfinder.com/data/icons/business-finance-ii-flat/2048/Business_Woman-4096.png`,
                    },
                    children: [
                      {
                        type: "person",
                        expanded: true,
                        data: {
                          motherUnit: "Anesthesiology",
                          name: "Malaika L. Salido-Ecalnir, MD",
                          role: "Head",
                          borderColor: "brown",
                          employmentType: "Plantilla",
                          employeeId: "RMBGH-RG-003",
                          image: `https://cdn2.iconfinder.com/data/icons/business-finance-ii-flat/2048/Business_Woman-4096.png`,
                        },
                        children: [
                          {
                            type: "person",
                            expanded: true,
                            data: {
                              motherUnit: "Emergency",
                              name: "Vacant",
                              role: "Officer-in-Charge",
                              borderColor: "brown",
                              employmentType: "Plantilla",
                              employeeId: "",
                              image: `https://cdn2.iconfinder.com/data/icons/business-finance-ii-flat/2048/Business_Woman-4096.png`,
                            },
                            children: [
                              {
                                type: "person",
                                expanded: true,
                                data: {
                                  motherUnit: "SICU",
                                  name: "Vacant",
                                  role: "Vacant",
                                  borderColor: "brown",
                                  employmentType: "Plantilla",
                                  employeeId: "",
                                  image: `https://cdn2.iconfinder.com/data/icons/business-finance-ii-flat/2048/Business_Woman-4096.png`,
                                },
                                children: [
                                  {
                                    type: "person",
                                    expanded: true,
                                    data: {
                                      motherUnit: "PACU",
                                      name: "Dr. Isabel Rivera",
                                      role: "Head",
                                      borderColor: "brown",
                                      employmentType: "Plantilla",
                                      employeeId: "RMBGH-RG-006",
                                      image: `https://cdn2.iconfinder.com/data/icons/business-finance-ii-flat/2048/Business_Woman-4096.png`,
                                    },
                                    children: [],
                                  },
                                ],
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },

          {
            type: "person",
            expanded: true,
            data: {
              motherUnit: "Ancillary Services",
              name: "Jocelyn Q. Gacasan, MD",
              role: "Assistant Director",
              borderColor: "pink",
              employmentType: "Plantilla",
              aligned: true,
              employeeId: "RMBGH-00005",
              image: `https://cdn2.iconfinder.com/data/icons/business-finance-ii-flat/2048/Business_Woman-4096.png`,
            },
            children: [
              {
                type: "person",
                expanded: true,
                data: {
                  motherUnit: "Pathology",
                  name: "Jocelyn Q. Gacasan, MD",
                  role: "Head",
                  borderColor: "brown",
                  employmentType: "Plantilla",
                  employeeId: "RMBGH-JG-001",
                  image: `https://cdn2.iconfinder.com/data/icons/business-finance-ii-flat/2048/Business_Woman-4096.png`,
                },
                children: [
                  {
                    type: "person",
                    expanded: true,
                    data: {
                      motherUnit: "Radiology Department",
                      name: "Maria Angeline DL. Nicandro, MD",
                      role: "Head",
                      borderColor: "brown",
                      employmentType: "Plantilla",
                      employeeId: "RMBGH-JG-002",
                      image: `https://cdn2.iconfinder.com/data/icons/business-finance-ii-flat/2048/Business_Woman-4096.png`,
                    },
                    children: [
                      {
                        type: "person",
                        expanded: true,
                        data: {
                          motherUnit: "Pharmacy",
                          name: "Maria Victoria R. Santos, RPH",
                          role: "Head",
                          borderColor: "brown",
                          employmentType: "Plantilla",
                          employeeId: "RMBGH-JG-003",
                          image: `https://cdn2.iconfinder.com/data/icons/business-finance-ii-flat/2048/Business_Woman-4096.png`,
                        },
                        children: [
                          {
                            type: "person",
                            expanded: true,
                            data: {
                              motherUnit: "Heart Station",
                              name: "Mario Victor M. Villardo, MD",
                              role: "Head",
                              borderColor: "brown",
                              employmentType: "Plantilla",
                              employeeId: "RMBGH-JG-004",
                              image: `https://cdn2.iconfinder.com/data/icons/business-finance-ii-flat/2048/Business_Woman-4096.png`,
                            },
                            children: [
                              {
                                type: "person",
                                expanded: true,
                                data: {
                                  motherUnit: "Pulmonary Unit",
                                  name: "Kate Lyn Anne L. Salvador, RRT",
                                  role: "Head",
                                  borderColor: "brown",
                                  employmentType: "Plantilla",
                                  employeeId: "RMBGH-JG-005",
                                  image: `https://cdn2.iconfinder.com/data/icons/business-finance-ii-flat/2048/Business_Woman-4096.png`,
                                },
                                children: [
                                  {
                                    type: "person",
                                    expanded: true,
                                    data: {
                                      motherUnit: "Dental Unit",
                                      name: "Arnold Benedict P. Yambao, DMD",
                                      role: "Head",
                                      borderColor: "brown",
                                      employmentType: "Plantilla",
                                      employeeId: "RMBGH-JG-006",
                                      image: `https://cdn2.iconfinder.com/data/icons/business-finance-ii-flat/2048/Business_Woman-4096.png`,
                                    },
                                    children: [
                                      {
                                        type: "person",
                                        expanded: true,
                                        data: {
                                          motherUnit: "Nutrition & Dietetics",
                                          name: "Jenifer C. Bagon",
                                          role: "Head",
                                          borderColor: "brown",
                                          employmentType: "Plantilla",
                                          employeeId: "RMBGH-JG-007",
                                          image: `https://cdn2.iconfinder.com/data/icons/business-finance-ii-flat/2048/Business_Woman-4096.png`,
                                        },
                                        children: [],
                                      },
                                    ],
                                  },
                                ],
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
      // Other Directors remain unchanged
      {
        type: "person",
        expanded: true,
        data: {
          motherUnit: "Hospital Director",
          name: "Raymond Rae R. Castañeda, MD",
          role: "Hospital Director",
          borderColor: "blue",
          employmentType: "Plantilla",
          aligned: true,
          employeeId: "RMBGH-00006",
          image: `https://cdn3.iconfinder.com/data/icons/avatars-flat/33/man_5-1024.png`,
        },
        children: [
          {
            type: "person",
            expanded: true,
            data: {
              motherUnit: "Facility Management Division",
              name: "Engr. Marc Napoleon A. Quiaoit III",
              role: "Chief",
              borderColor: "red",
              employmentType: "Plantilla",
              aligned: true,
              employeeId: "RMBGH-00007",
              image: `https://cdn3.iconfinder.com/data/icons/avatars-flat/33/man_5-1024.png`,
            },
            children: [
              {
                type: "person",
                expanded: true,
                data: {
                  motherUnit: "Property Management",
                  name: "Engr. Joshua Anthony L. Palaad",
                  role: "Head",
                  borderColor: "brown",
                  employmentType: "Plantilla",
                  employeeId: "RMBGH-FM-001",
                  image: `https://cdn3.iconfinder.com/data/icons/avatars-flat/33/man_5-1024.png`,
                },
                children: [
                  {
                    type: "person",
                    expanded: true,
                    data: {
                      motherUnit: "Engineering Department",
                      name: "Engr. Cristopher P. Española",
                      role: "Officer-In-Charge",
                      borderColor: "brown",
                      employmentType: "Plantilla",
                      employeeId: "RMBGH-FM-002",
                      image: `https://cdn3.iconfinder.com/data/icons/avatars-flat/33/man_5-1024.png`,
                    },
                    children: [
                      {
                        type: "person",
                        expanded: true,
                        data: {
                          motherUnit: "Design and Planning",
                          name: "Engr. Marc Napoleon A. Quiaoit III",
                          role: "Head",
                          borderColor: "brown",
                          employmentType: "Plantilla",
                          employeeId: "RMBGH-FM-003",
                          image: `https://cdn2.iconfinder.com/data/icons/business-finance-ii-flat/2048/Business_Woman-4096.png`,
                        },
                        children: [
                          {
                            type: "person",
                            expanded: true,
                            data: {
                              motherUnit: "Linen/Housekeeping",
                              name: "Cherry N. Borja",
                              role: "Officer-In-Charge",
                              borderColor: "brown",
                              employmentType: "Plantilla",
                              employeeId: "RMBGH-FM-004",
                              image: `https://cdn3.iconfinder.com/data/icons/avatars-flat/33/man_5-1024.png`,
                            },
                            children: [
                              {
                                type: "person",
                                expanded: true,
                                data: {
                                  motherUnit: "Security",
                                  name: "Apolinario R. Autor",
                                  role: "Officer-In-Charge",
                                  borderColor: "brown",
                                  employmentType: "Plantilla",
                                  employeeId: "RMBGH-FM-005",
                                  image: `https://cdn2.iconfinder.com/data/icons/business-finance-ii-flat/2048/Business_Woman-4096.png`,
                                },
                                children: [],
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },

          {
            type: "person",
            expanded: true,
            data: {
              motherUnit: "Hospital Administration Division",
              name: "Bradford Antonio C. Martinez, DBA",
              role: "Chief",
              borderColor: "red",
              employmentType: "Plantilla",
              aligned: true,
              employeeId: "RMBGH-00008",
              image: `https://cdn3.iconfinder.com/data/icons/avatars-flat/33/man_5-1024.png`,
            },
            children: [
              {
                type: "person",
                expanded: true,
                data: {
                  motherUnit: "Health Information Management Cluster",
                  name: "Ruel V. Subaran",
                  role: "Officer-in-Charge",
                  borderColor: "purple",
                  employmentType: "Plantilla",
                  aligned: true,
                  employeeId: "RMBGH-00009",
                  image: `https://cdn3.iconfinder.com/data/icons/avatars-flat/33/man_5-1024.png`,
                },
                children: [
                  {
                    type: "person",
                    expanded: true,
                    data: {
                      motherUnit: "Medical Records",
                      name: "Ma. Lourdes Teresa E. Jawili",
                      role: "Head",
                      borderColor: "brown",
                      employmentType: "Plantilla",
                      employeeId: "RMBGH-HIM-001",
                      image: `https://cdn2.iconfinder.com/data/icons/business-finance-ii-flat/2048/Business_Woman-4096.png`,
                    },
                    children: [
                      {
                        type: "person",
                        expanded: true,
                        data: {
                          motherUnit: "Information Technology",
                          name: "Jan Bert I. Doqunia",
                          role: "Officer-In-Charge",
                          borderColor: "brown",
                          employmentType: "Plantilla",
                          employeeId: "RMBGH-HIM-002",
                          image: `https://cdn3.iconfinder.com/data/icons/avatars-flat/33/man_5-1024.png`,
                        },
                        children: [
                          {
                            type: "person",
                            expanded: true,
                            data: {
                              motherUnit: "Admitting Section",
                              name: "Julina N. De Asis",
                              role: "Officer-In-Charge",
                              borderColor: "brown",
                              employmentType: "Plantilla",
                              employeeId: "RMBGH-HIM-003",
                              image: `https://cdn2.iconfinder.com/data/icons/business-finance-ii-flat/2048/Business_Woman-4096.png`,
                            },
                            children: [],
                          },
                        ],
                      },
                    ],
                  },
                ],
              },

              {
                type: "person",
                expanded: true,
                data: {
                  motherUnit: "Patient Care Support Services Cluster",
                  name: "Uziel A. Rutaquio, RSW",
                  role: "Head",
                  borderColor: "purple",
                  employmentType: "Plantilla",
                  aligned: true,
                  employeeId: "RMBGH-00009",
                  image: `https://cdn3.iconfinder.com/data/icons/avatars-flat/33/man_5-1024.png`,
                },
                children: [
                  {
                    type: "person",
                    expanded: true,
                    data: {
                      motherUnit: "Medical Social Service Department",
                      name: "Ma. Cristina D. Pacubas, RSW",
                      role: "Officer-In-Charge",
                      borderColor: "brown",
                      employmentType: "Plantilla",
                      employeeId: "RMBGH-HIM-001",
                      image: `https://cdn2.iconfinder.com/data/icons/business-finance-ii-flat/2048/Business_Woman-4096.png`,
                    },
                    children: [
                      {
                        type: "person",
                        expanded: true,
                        data: {
                          motherUnit: "Dietary",
                          name: "Teresita P. Abrico, RND",
                          role: "Head",
                          borderColor: "brown",
                          employmentType: "Plantilla",
                          employeeId: "RMBGH-HIM-002",
                          image: `https://cdn3.iconfinder.com/data/icons/avatars-flat/33/man_5-1024.png`,
                        },
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },

      {
        type: "person",
        expanded: true,
        data: {
          motherUnit: "Finance Director",
          name: "Pia Angelina C. Tan, CPA",
          role: "Finance Director",
          borderColor: "blue",
          employmentType: "Plantilla",
          aligned: true,
          employeeId: "RMBGH-00011",
          image: `https://cdn2.iconfinder.com/data/icons/business-finance-ii-flat/2048/Business_Woman-4096.png`,
        },
        children: [
          {
            type: "person",
            expanded: true,
            data: {
              motherUnit: "Finance Services",
              name: "Ronilo M. Jose, CPA",
              role: "Head",
              borderColor: "brown",
              employmentType: "Plantilla",
              aligned: true,
              employeeId: "RMBGH-FIN-CL-001",
              image: `https://cdn3.iconfinder.com/data/icons/avatars-flat/33/man_5-1024.png`,
            },
            children: [
              {
                type: "person",
                expanded: true,
                data: {
                  motherUnit: "Budget Department",
                  name: "Maria Ruth S. Galut",
                  role: "Officer-In-Charge",
                  borderColor: "brown",
                  employmentType: "Plantilla",
                  aligned: true,
                  employeeId: "RMBGH-FIN-001",
                  image: `https://cdn2.iconfinder.com/data/icons/business-finance-ii-flat/2048/Business_Woman-4096.png`,
                },
                children: [
                  {
                    type: "person",
                    expanded: true,
                    data: {
                      motherUnit: "Billing and Claims",
                      name: "Judith Fatima E. Garcia, MD",
                      role: "Head",
                      borderColor: "brown",
                      employmentType: "Plantilla",
                      aligned: true,
                      employeeId: "RMBGH-FIN-002",
                      image: `https://cdn2.iconfinder.com/data/icons/business-finance-ii-flat/2048/Business_Woman-4096.png`,
                    },
                    children: [
                      {
                        type: "person",
                        expanded: true,
                        data: {
                          motherUnit: "Procurement/Warehouse/Inventory",
                          name: "Donnary Gavan",
                          role: "",
                          borderColor: "brown",
                          employmentType: "Plantilla",
                          aligned: true,
                          employeeId: "RMBGH-FIN-003",
                          image: `https://cdn3.iconfinder.com/data/icons/avatars-flat/33/man_5-1024.png`,
                        },
                        children: [
                          {
                            type: "person",
                            expanded: true,
                            data: {
                              motherUnit: "Cash Management",
                              name: "Marion May M. Cervera",
                              role: "Head",
                              borderColor: "brown",
                              employmentType: "Plantilla",
                              aligned: true,
                              employeeId: "RMBGH-FIN-004",
                              image: `https://cdn3.iconfinder.com/data/icons/avatars-flat/33/man_5-1024.png`,
                            },
                            children: [],
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },

      {
        type: "person",
        expanded: true,
        data: {
          motherUnit: "Nursing Director",
          name: "Neil G. Cabbo, RN, MAN",
          role: "Nursing Director",
          borderColor: "blue",
          employmentType: "Plantilla",
          aligned: true,
          employeeId: "RMBGH-00012",
          image: `https://cdn3.iconfinder.com/data/icons/avatars-flat/33/man_5-1024.png`,
        },
        children: [
          // LEFT ASSISTANT
          {
            type: "person",
            expanded: true,
            data: {
              motherUnit: "Assistant Nursing Director",
              name: "Ma. Vicarl T. Estacio, RN",
              role: "for Patient Services / Division Secretary",
              borderColor: "purple",
              employmentType: "Plantilla",
              aligned: true,
              employeeId: "RMBGH-NUR-001",
              image: `https://cdn2.iconfinder.com/data/icons/business-finance-ii-flat/2048/Business_Woman-4096.png`,
            },
            children: [
              {
                type: "person",
                expanded: true,
                data: {
                  motherUnit: "Infection Prevention & Control Nurse",
                  name: "Ma. Vicarl T. Estacio, RN",
                  role: "IPCN",
                  borderColor: "brown",
                  employmentType: "Plantilla",
                  employeeId: "RMBGH-NUR-002",
                  image: `https://cdn2.iconfinder.com/data/icons/business-finance-ii-flat/2048/Business_Woman-4096.png`,
                },
                children: [
                  {
                    type: "person",
                    expanded: true,
                    data: {
                      motherUnit: "Nursing Quality & Assurance Nurse",
                      name: "Kimberly Beth P. Kampton, RN",
                      role: "NQAN",
                      borderColor: "brown",
                      employmentType: "Plantilla",
                      employeeId: "RMBGH-NUR-003",
                      image: `https://cdn2.iconfinder.com/data/icons/business-finance-ii-flat/2048/Business_Woman-4096.png`,
                    },
                    children: [],
                  },
                ],
              },
            ],
          },

          // CENTER SUPERVISORS (VERTICAL)
          {
            type: "person",
            expanded: true,
            data: {
              motherUnit: "Outpatient Department",
              name: "Marijane A. Lagno, RN",
              role: "Supervisor",
              borderColor: "brown",
              employmentType: "Plantilla",
              employeeId: "RMBGH-NUR-004",
              image: `https://cdn2.iconfinder.com/data/icons/business-finance-ii-flat/2048/Business_Woman-4096.png`,
            },
            children: [
              {
                type: "person",
                expanded: true,
                data: {
                  motherUnit: "Emergency Room",
                  name: "Connie Ann H. Silva, RN",
                  role: "Supervisor",
                  borderColor: "brown",
                  employmentType: "Plantilla",
                  employeeId: "RMBGH-NUR-005",
                  image: `https://cdn2.iconfinder.com/data/icons/business-finance-ii-flat/2048/Business_Woman-4096.png`,
                },
                children: [
                  {
                    type: "person",
                    expanded: true,
                    data: {
                      motherUnit: "OR / DR",
                      name: "Herminio E. Sarmiento, RN",
                      role: "Supervisor",
                      borderColor: "brown",
                      employmentType: "Plantilla",
                      employeeId: "RMBGH-NUR-006",
                      image: `https://cdn3.iconfinder.com/data/icons/avatars-flat/33/man_5-1024.png`,
                    },
                    children: [
                      {
                        type: "person",
                        expanded: true,
                        data: {
                          motherUnit: "Special Care Department",
                          name: "Noreen Eunice C. Cruz, RN",
                          role: "Supervisor",
                          borderColor: "brown",
                          employmentType: "Plantilla",
                          employeeId: "RMBGH-NUR-007",
                          image: `https://cdn2.iconfinder.com/data/icons/business-finance-ii-flat/2048/Business_Woman-4096.png`,
                        },
                        children: [
                          {
                            type: "person",
                            expanded: true,
                            data: {
                              motherUnit: "General Nursing Department",
                              name: "Ranee G. Sangalang, RM, RN, MAN",
                              role: "Supervisor",
                              borderColor: "brown",
                              employmentType: "Plantilla",
                              employeeId: "RMBGH-NUR-008",
                              image: `https://cdn2.iconfinder.com/data/icons/business-finance-ii-flat/2048/Business_Woman-4096.png`,
                            },
                            children: [
                              {
                                type: "person",
                                expanded: true,
                                data: {
                                  motherUnit:
                                    "Central Supply & Sterilization Department",
                                  name: "Darwin O. Leonardo, RN",
                                  role: "Supervisor",
                                  borderColor: "brown",
                                  employmentType: "Plantilla",
                                  employeeId: "RMBGH-NUR-009",
                                  image: `https://cdn3.iconfinder.com/data/icons/avatars-flat/33/man_5-1024.png`,
                                },
                                children: [],
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },

          // RIGHT ASSISTANT
          {
            type: "person",
            expanded: true,
            data: {
              motherUnit: "Assistant Nursing Director",
              name: "Lady Jane G. Gaffud-Carabagan, RN, MAN",
              role: "for Administration & Training",
              borderColor: "purple",
              employmentType: "Plantilla",
              aligned: true,
              employeeId: "RMBGH-NUR-010",
              image: `https://cdn2.iconfinder.com/data/icons/business-finance-ii-flat/2048/Business_Woman-4096.png`,
            },
            children: [
              {
                type: "person",
                expanded: true,
                data: {
                  motherUnit: "Research",
                  name: "Vacant",
                  role: "Vacant",
                  borderColor: "gray",
                  employmentType: "Plantilla",
                  employeeId: "",
                  image: `https://cdn3.iconfinder.com/data/icons/avatars-flat/33/man_5-1024.png`,
                },
                children: [
                  {
                    type: "person",
                    expanded: true,
                    data: {
                      motherUnit: "Community Extension",
                      name: "Vacant",
                      role: "Vacant",
                      borderColor: "gray",
                      employmentType: "Plantilla",
                      employeeId: "",
                      image: `https://cdn3.iconfinder.com/data/icons/avatars-flat/33/man_5-1024.png`,
                    },
                    children: [],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
];
