# Vehicle status choices (business state)
class VehicleStatus:
    ACTIVE = "active"
    UNDER_MAINTENANCE = "under_maintenance"
    RETIRED = "retired"
    STANDBY = "standby"

    CHOICES = [
        (ACTIVE, "Active"),
        (UNDER_MAINTENANCE, "Under Maintenance"),
        (RETIRED, "Retired"),
        (STANDBY, "Standby"),
    ]


# Fuel type choices
class FuelType:
    PETROL = "petrol"
    DIESEL = "diesel"
    ELECTRIC = "electric"
    HYBRID = "hybrid"
    CNG = "cng"

    CHOICES = [
        (PETROL, "Petrol"),
        (DIESEL, "Diesel"),
        (ELECTRIC, "Electric"),
        (HYBRID, "Hybrid"),
        (CNG, "Compressed Natural Gas"),
    ]


# Ownership type
class OwnershipType:
    COMPANY_OWNED = "company_owned"
    LEASED = "leased"
    CONTRACT_HIRE = "contract_hire"
    OTHER = "other"

    CHOICES = [
        (COMPANY_OWNED, "Company Owned"),
        (LEASED, "Leased"),
        (CONTRACT_HIRE, "Contract Hire"),
        (OTHER, "Other"),
    ]
