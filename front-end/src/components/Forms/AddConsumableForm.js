// AddConsumableForm.jsx
import React, { useState } from 'react';
import {
    Container,
    Form,
    Button,
    Accordion,
    Card,
    Row,
    Col,
    Alert,
    Spinner,
} from 'react-bootstrap';
import '../../css/AddConsumableForm.css';

const AddConsumableForm = () => {
    const [itemName, setItemName] = useState('');
    const [type, setType] = useState('');
    const [calories, setCalories] = useState(0);
    const [protein, setProtein] = useState(0.0);
    const [carbohydrates, setCarbohydrates] = useState(0.0);
    const [fat, setFat] = useState(0.0);

    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const [isLoading, setIsLoading] = useState(false);

    const [nutritionalInfo, setNutritionalInfo] = useState({
        Carbohydrates: {
          Fibers: 0.0,
          Starch: 0.0,
          Sugars: 0.0,
          galactose: 0.0,
          Glucose: 0.0,
          Sucrose: 0.0,
          lactose: 0.0,
          Maltose: 0.0,
          Fructose: 0.0,
        },
        Vitamins: {
          Betaine: 0.0,
          "Vitamin A": 0.0,
          "Vitamin B1 (thiamine)": 0.0,
          "Vitamin B2 (riboflavin)": 0.0,
          "Vitamin B3 (niacin)": 0.0,
          "Vitamin B4 (choline)": 0.0,
          "Vitamin B5 (Pantothenic Acid)": 0.0,
          "Vitamin B6 (Pyridoxine)": 0.0,
          "Vitamin B9 (Folic Acid)": 0.0,
          "Vitamin B12 (Cobalcamine)": 0.0,
          "Vitamin C": 0.0,
          "Vitamin D": 0.0,
          "Vitamin E": 0.0,
          "Vitamin K1": 0.0,
          "Vitamin K2 (MK04)": 0.0,
        },
        AminoAcids: {
          Alanine: 0.0,
          Arginine: 0.0,
          "Aspartic acid": 0.0,
          Valin: 0.0,
          Glycine: 0.0,
          glutamine: 0.0,
          Isoleucine: 0.0,
          Leucine: 0.0,
          Lysine: 0.0,
          Methionine: 0.0,
          Proline: 0.0,
          Serine: 0.0,
          Tyrosine: 0.0,
          Threonine: 0.0,
          tryptophan: 0.0,
          Phenylalanine: 0.0,
          Hydroxyproline: 0.0,
          histidine: 0.0,
          Cystine: 0.0,
        },
        Fats: {
          "Monounsaturated fats": 0.0,
          "Polyunsaturated fats": 0.0,
          "Saturated fat": 0.0,
          "Trans fats": 0.0,
        },
        Minerals: {
          Iron: 0.0,
          Potassium: 0.0,
          Calcium: 0.0,
          Magnesium: 0.0,
          Manganese: 0.0,
          Med: 0.0,
          Sodium: 0.0,
          Selenium: 0.0,
          Fluoride: 0.0,
          Phosphorus: 0.0,
          Zinc: 0.0,
        },
        Sterols: {
          Cholesterol: 0.0,
          Phytosterols: 0.0,
          Stigmasteroli: 0.0,
          Campesteroli: 0.0,
          "Beta-sitosterols": 0.0,
        },
        More: {
          Alcohol: 0.0,
          Water: 0.0,
          Caffeine: 0.0,
          Theobromine: 0.0,
          Ashes: 0.0,
        },
      });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMessage('');
        setSuccessMessage('');

        const flattenNutritionalInfo = [];
        Object.entries(nutritionalInfo).forEach(([category, nutrients]) => {
            Object.entries(nutrients).forEach(([name, amount]) => {
                flattenNutritionalInfo.push({
                    Category: category,
                    Name: name,
                    Amount: parseFloat(amount),
                });
            });
        });
    
        const consumableItem = {
            Name: itemName,
            CaloriesPer100g: calories,
            ProteinPer100g: protein,
            CarbohydratePer100g: carbohydrates,
            FatPer100g: fat,
            Type: parseInt(type),
            NutritionalInformation: flattenNutritionalInfo,
        };

        try {
            const response = await fetch('https://localhost:7009/api/admin/add-consumable-item',
                {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(consumableItem),
                }
            );

            if (!response.ok) {
                throw new Error('Adding a consumable item failed');
            }

            setSuccessMessage('Consumable item added successfully!');
            resetForm();
        } catch (err) {
            setErrorMessage(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setItemName('');
        setType('');
        setCalories(0);
        setProtein(0.0);
        setCarbohydrates(0.0);
        setFat(0.0);
        setNutritionalInfo({
            Carbohydrates: {
                Fibers: 0.0,
                Starch: 0.0,
                Sugars: 0.0,
                Galactose: 0.0,
                Glucose: 0.0,
                Sucrose: 0.0,
                Lactose: 0.0,
                Maltose: 0.0,
                Fructose: 0.0,
            },
            Vitamins: {
                Betaine: 0.0,
                'Vitamin A': 0.0,
                'Vitamin B1 (Thiamine)': 0.0,
                'Vitamin B2 (Riboflavin)': 0.0,
                'Vitamin B3 (Niacin)': 0.0,
                'Vitamin B4 (Choline)': 0.0,
                'Vitamin B5 (Pantothenic Acid)': 0.0,
                'Vitamin B6 (Pyridoxine)': 0.0,
                'Vitamin B9 (Folic Acid)': 0.0,
                'Vitamin B12 (Cobalamin)': 0.0,
                'Vitamin C': 0.0,
                'Vitamin D': 0.0,
                'Vitamin E': 0.0,
                'Vitamin K1': 0.0,
                'Vitamin K2 (MK04)': 0.0,
            },
            AminoAcids: {
                Alanine: 0.0,
                Arginine: 0.0,
                'Aspartic Acid': 0.0,
                Valin: 0.0,
                Glycine: 0.0,
                Glutamine: 0.0,
                Isoleucine: 0.0,
                Leucine: 0.0,
                Lysine: 0.0,
                Methionine: 0.0,
                Proline: 0.0,
                Serine: 0.0,
                Tyrosine: 0.0,
                Threonine: 0.0,
                Tryptophan: 0.0,
                Phenylalanine: 0.0,
                Hydroxyproline: 0.0,
                Histidine: 0.0,
                Cystine: 0.0,
            },
            Fats: {
                'Monounsaturated Fats': 0.0,
                'Polyunsaturated Fats': 0.0,
                'Saturated Fat': 0.0,
                'Trans Fats': 0.0,
            },
            Minerals: {
                Iron: 0.0,
                Potassium: 0.0,
                Calcium: 0.0,
                Magnesium: 0.0,
                Manganese: 0.0,
                Med: 0.0,
                Sodium: 0.0,
                Selenium: 0.0,
                Fluoride: 0.0,
                Phosphorus: 0.0,
                Zinc: 0.0,
            },
            Sterols: {
                Cholesterol: 0.0,
                Phytosterols: 0.0,
                Stigmasteroli: 0.0,
                Campesteroli: 0.0,
                'Beta-sitosterols': 0.0,
            },
            More: {
                Alcohol: 0.0,
                Water: 0.0,
                Caffeine: 0.0,
                Theobromine: 0.0,
                Ashes: 0.0,
            },
        });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        switch (name) {
            case 'name':
                setItemName(value);
                break;
            case 'type':
                setType(value);
                break;
            case 'caloriesPer100g':
                setCalories(parseFloat(value));
                break;
            case 'proteinPer100g':
                setProtein(parseFloat(value));
                break;
            case 'carbohydratePer100g':
                setCarbohydrates(parseFloat(value));
                break;
            case 'fatPer100g':
                setFat(parseFloat(value));
                break;
            default:
                break;
        }
    };

    const handleNutritionalChange = (section, key, value) => {
        setNutritionalInfo((prevInfo) => ({
            ...prevInfo,
            [section]: {
                ...prevInfo[section],
                [key]: parseFloat(value),
            },
        }));
    };

    const renderNutritionalSection = (sectionName, sectionData, title) => (
        <Accordion.Item eventKey={sectionName} key={sectionName}>
            <Accordion.Header>{title}</Accordion.Header>
            <Accordion.Body>
                <Row>
                    {Object.entries(sectionData).map(([key, value]) => (
                        <Col md={4} sm={6} xs={12} className="mb-3" key={key}>
                            <Form.Group controlId={`${sectionName}-${key}`}>
                                <Form.Label>{key}</Form.Label>
                                <Form.Control
                                    type="number"
                                    step="1"
                                    name={key}
                                    value={value}
                                    onChange={(e) => handleNutritionalChange(sectionName, key, e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                    ))}
                </Row>
            </Accordion.Body>
        </Accordion.Item>
    );

    return (
        <Container className="add-consumable-form mt-5 mb-5">
            <h2 className="mb-4">Add New Consumable</h2>
            {errorMessage && (
                <Alert variant="danger" className="mt-3">
                    {errorMessage}
                </Alert>
            )}
            {successMessage && (
                <Alert variant="success" className="mt-3">
                    {successMessage}
                </Alert>
            )}
            <Form onSubmit={handleSubmit}>
                {/* Name */}
                <Form.Group controlId="name" className="mb-3">
                    <Form.Label>Name:</Form.Label>
                    <Form.Control
                        type="text"
                        name="name"
                        value={itemName}
                        onChange={handleChange}
                        required
                        placeholder="Enter item name"
                    />
                </Form.Group>

                {/* Type */}
                <Form.Group controlId="type" className="mb-3">
                    <Form.Label>Type:</Form.Label>
                    <Form.Control as="select" name="type" value={type} onChange={handleChange} required>
                        <option value="">Select meal type</option>
                        <option value="0">Food</option>
                        <option value="1">Drink</option>
                        <option value="2">Meal</option>
                    </Form.Control>
                </Form.Group>

                {/* Calories */}
                <Form.Group controlId="caloriesPer100g" className="mb-3">
                    <Form.Label>Calories per 100g:</Form.Label>
                    <Form.Control
                        type="number"
                        name="caloriesPer100g"
                        value={calories}
                        onChange={handleChange}
                        required
                        placeholder="Enter calories per 100g"
                    />
                </Form.Group>

                {/* Protein */}
                <Form.Group controlId="proteinPer100g" className="mb-3">
                    <Form.Label>Protein per 100g:</Form.Label>
                    <Form.Control
                        type="number"
                        step="1"
                        name="proteinPer100g"
                        value={protein}
                        onChange={handleChange}
                        required
                        placeholder="Enter protein per 100g"
                    />
                </Form.Group>

                {/* Carbohydrate */}
                <Form.Group controlId="carbohydratePer100g" className="mb-3">
                    <Form.Label>Carbohydrate per 100g:</Form.Label>
                    <Form.Control
                        type="number"
                        step="1"
                        name="carbohydratePer100g"
                        value={carbohydrates}
                        onChange={handleChange}
                        required
                        placeholder="Enter carbohydrate per 100g"
                    />
                </Form.Group>

                {/* Fat */}
                <Form.Group controlId="fatPer100g" className="mb-3">
                    <Form.Label>Fat per 100g:</Form.Label>
                    <Form.Control
                        type="number"
                        step="1"
                        name="fatPer100g"
                        value={fat}
                        onChange={handleChange}
                        required
                        placeholder="Enter fat per 100g"
                    />
                </Form.Group>

                {/* Nutritional Information */}
                <Accordion defaultActiveKey="0" className="mb-3">
                    {renderNutritionalSection('Carbohydrates', nutritionalInfo.Carbohydrates, 'Carbohydrate Information')}
                    {renderNutritionalSection('Vitamins', nutritionalInfo.Vitamins, 'Vitamins')}
                    {renderNutritionalSection('AminoAcids', nutritionalInfo.AminoAcids, 'Amino Acids')}
                    {renderNutritionalSection('Fats', nutritionalInfo.Fats, 'Fats')}
                    {renderNutritionalSection('Minerals', nutritionalInfo.Minerals, 'Minerals')}
                    {renderNutritionalSection('Sterols', nutritionalInfo.Sterols, 'Sterols')}
                    {renderNutritionalSection('More', nutritionalInfo.More, 'Additional Information')}
                </Accordion>

                {/* Submit Button */}
                <Button variant="primary" type="submit" disabled={isLoading}>
                    {isLoading ? (
                        <>
                            <Spinner
                                as="span"
                                animation="border"
                                size="sm"
                                role="status"
                                aria-hidden="true"
                                className="me-2"
                            />
                            Loading...
                        </>
                    ) : (
                        'Add Consumable'
                    )}
                </Button>
            </Form>
        </Container>
    );
};

export default AddConsumableForm;
