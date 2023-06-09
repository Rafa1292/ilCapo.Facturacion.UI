import React, { useEffect, useState } from 'react'
import { SaleItemCategory } from '../../types/saleItemCategory'
import { SaleItem } from '../../types/saleItem'
import BillMakerProducts from './BillMakerProducts'
import { BillItem } from '../../types/billItem'
import { BillItemLinkedProduct } from '../../types/billItemLinkedProduct'
import { LinkedProduct } from '../../types/linkedProduct'
import { SaleItemProduct } from '../../types/saleItemProduct'
import { Product } from '../../types/product'
import { LinkedProductModifier } from '../../types/linkedProductModifier'
import { LinkedProductModifierElement } from '../../types/linkedProductModifierElement'
import { ModifierElement } from '../../types/modifierElement'
import { parseCurrency } from '../../utils/currencyParser'

interface Props {
  saleItemCategory: SaleItemCategory
  editBilItem: BillItem
  tableNumber: number
}

const initialBillItem: BillItem = {
  id: 0,
  quantity: 1,
  billId: 0,
  saleItemId: 0,
  billProducts: [],
  delete: false,
  description: '',
  discount: 0,
  kitchenMessage: false,
  tax: 0,
  unitPrice: 0,
  createdBy: 0,
  updatedBy: 0
}

const initialBillItemLinkedProduct: BillItemLinkedProduct = {
  id: 0,
  billItemId: 0,
  delete: false,
  itemNumber: 0,
  saleItemProductId: 0,
  combined: false,
  description: '',
  products: [],
  createdBy: 0,
  updatedBy: 0
}

const initialLinkedProduct: LinkedProduct = {
  id: 0,
  billProductId: 0,
  delete: false,
  modifiers: [],
  isCommanded: false,
  name: '',
  productId: 0,
  unitPrice: 0,
  createdBy: 0,
  updatedBy: 0
}

const initialLinkedProductModifierElement: LinkedProductModifierElement = {
  id: 0,
  linkedProductModifierId: 0,
  delete: false,
  price: 0,
  name: '',
  quantity: 1,
  modifierElementId: 0,
  createdBy: 0,
  updatedBy: 0
}

const BillMakerItems = ({ saleItemCategory, tableNumber, editBilItem }: Props) => {
  const [saleItem, setSaleItem] = useState<SaleItem>()
  const [billItem, setBillItem] = useState<BillItem>(initialBillItem)

  const newBillItem = (saleItem: SaleItem) => {
    setSaleItem(saleItem)
    const currentBillItem = {
      ...initialBillItem,
      saleItemId: saleItem.id,
      unitPrice: saleItem.price,
      description: saleItem.name,
      billProducts: newBillItemLinkedProduct(saleItem)
    }
    setBillItem(currentBillItem)
  }

  const newBillItemLinkedProduct = (saleItem: SaleItem): BillItemLinkedProduct[] => {
    const billItemLinkedProducts: BillItemLinkedProduct[] = []
    saleItem.saleItemProducts.map((saleItemProduct) => {
      const billItemLinkedProduct = {
        ...initialBillItemLinkedProduct,
        id: 0,
        saleItemProductId: saleItemProduct.id,
        itemNumber: 1,
        products: [newLinkedProduct(saleItemProduct)]
      }
      billItemLinkedProducts.push(billItemLinkedProduct)
    })
    return billItemLinkedProducts
  }

  const newLinkedProduct = (saleItemProduct: SaleItemProduct): LinkedProduct => {
    const linkedProduct = {
      ...initialLinkedProduct,
      id: billItem.billProducts.length + 1,
      productId: saleItemProduct.product.id,
      unitPrice: saleItemProduct.product.price,
      name: saleItemProduct.product.name,
      modifiers: newLinkedProductModifiers(saleItemProduct.product)
    }
    return linkedProduct
  }

  const newLinkedProductModifiers = (product: Product): LinkedProductModifier[] => {
    const linkedProductModifiers: LinkedProductModifier[] = []
    product.productModifiers.map((productModifier) => {
      const linkedProductModifier: LinkedProductModifier = {
        id: 0,
        linkedProductId: 0,
        delete: false,
        modifierGroupId: productModifier.modifierGroup.id,
        elements: [],
        label: productModifier.modifierGroup.label,
        maxSelectable: productModifier.modifierGroup.maxSelectable,
        minSelectable: productModifier.modifierGroup.minSelectable,
        name: productModifier.modifierGroup.name,
        quantity: 1,
        createdBy: 0,
        updatedBy: 0
      }
      linkedProductModifiers.push(linkedProductModifier)
    })
    return linkedProductModifiers
  }

  const newLinkedProductModifierElement = (modifierElement: ModifierElement, saleItemProductId: number) => {
    const newLinkedProductModifierElement: LinkedProductModifierElement = {
      ...initialLinkedProductModifierElement,
      modifierElementId: modifierElement.id,
      name: modifierElement.name,
      price: modifierElement.price,
      quantity: 1
    }
    for (const billItemLinkedProduct of billItem.billProducts) {
      if (billItemLinkedProduct.saleItemProductId === saleItemProductId) {
        for (const linkedProduct of billItemLinkedProduct.products) {
          for (const productModifier of linkedProduct.modifiers) {
            if (productModifier.modifierGroupId === modifierElement.modifierGroupId) {
              const currentLinkedProductModifierElement = productModifier.elements.find((x) => x.modifierElementId === modifierElement.id)
              if (currentLinkedProductModifierElement) {
                currentLinkedProductModifierElement.quantity = currentLinkedProductModifierElement.quantity + 1
              } else {
                productModifier.elements.push(newLinkedProductModifierElement)
              }
            }
          }
        }
      }
    }
  }

  const newCombinedLinkedProduct = (linkedProduct: LinkedProduct, saleItemProductId: number) => {
    for (const billItemLinkedProduct of billItem.billProducts) {
      if (billItemLinkedProduct.saleItemProductId === saleItemProductId) {
        const tmpLinkedProducts = billItemLinkedProduct.products.filter((linkedProduct) => linkedProduct.id !== 0)
        tmpLinkedProducts.push(linkedProduct)
        billItemLinkedProduct.products = tmpLinkedProducts
      }
    }
  }

  const removeLinkedProductModifierElement = (modifierElement: ModifierElement, saleItemProductId: number) => {
    for (const billItemLinkedProduct of billItem.billProducts) {
      if (billItemLinkedProduct.saleItemProductId === saleItemProductId) {
        for (const linkedProduct of billItemLinkedProduct.products) {
          for (const productModifier of linkedProduct.modifiers) {
            if (productModifier.modifierGroupId === modifierElement.modifierGroupId) {
              const tmpLinkedProductModifier = productModifier.elements.find((linkedProductModifierElement) => linkedProductModifierElement.modifierElementId === modifierElement.id)
              if (tmpLinkedProductModifier) {
                if (tmpLinkedProductModifier.quantity > 1) {
                  tmpLinkedProductModifier.quantity = tmpLinkedProductModifier.quantity - 1
                } else {
                  productModifier.elements = productModifier.elements.filter((linkedProductModifierElement) => linkedProductModifierElement.modifierElementId !== modifierElement.id)
                }
              }
            }
          }
        }
      }
    }
  }

  const setNewBillItem = () => {
    setBillItem(initialBillItem)
  }


  useEffect(() => {
    if (editBilItem?.saleItemId > 0) {
      const tmpSaleItem = saleItemCategory?.saleItems.find((saleItem) => saleItem.id === editBilItem?.saleItemId)
      setSaleItem(tmpSaleItem)
      setBillItem(editBilItem)
    }
    else {
      setSaleItem(undefined)
    }
  }, [saleItemCategory, editBilItem])

  return (
    <>
      <div className="col-12 d-flex flex-wrap justify-content-center align-items-center">
        <div className="col-12 d-flex flex-wrap justify-content-center align-items-center" style={{ height: saleItem !== undefined ? '0px' : '200px' }}>
          {
            saleItem === undefined &&
            saleItemCategory?.saleItems.map((tmpSaleItem, index) => {
              return (
                <div key={index} className="col-3 p-2 pointer" onClick={() => newBillItem(tmpSaleItem)}>
                  <div className="card shadow bill-item" >
                    <div className="card-body d-flex flex-wrap justify-content-center align-content-center">
                      <h5 className="card-title mb-4 text-center">{tmpSaleItem.name}</h5>
                      <h5 className="card-text col-12 text-center">{Number(tmpSaleItem.price) === 0 ? '' : parseCurrency(Number(tmpSaleItem.price).toString())}</h5>
                    </div>
                  </div>
                </div>
              )
            })
          }
        </div>
        {
          saleItem &&
          <BillMakerProducts
            setSaleItem={setSaleItem}
            newCombinedLinkedProduct={newCombinedLinkedProduct}
            setNewBillItem={setNewBillItem} removeLinkedProductModifierElement={removeLinkedProductModifierElement} 
            addLinkedProductModifierElement={newLinkedProductModifierElement} 
            tableNumber={tableNumber}
            billItem={billItem} 
            saleItem={saleItem} />
        }
      </div>
    </>
  )
}

export default BillMakerItems