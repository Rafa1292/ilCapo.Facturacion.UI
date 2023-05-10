import React, { useEffect, useState } from 'react'
import '../../scss/billMakerProducts.scss'
import { SaleItem } from '../../types/saleItem'
import { Product } from '../../types/product'
import BillMakerModifierGroups from './BillMakerModifierGroups'
import { BillItem } from '../../types/billItem'
import { ModifierElement } from '../../types/modifierElement'
import { LinkedProduct } from '../../types/linkedProduct'
import { parseCurrency } from '../../utils/currencyParser'
import { SaleItemCategory } from '../../types/saleItemCategory'

interface Props {
  saleItem: SaleItem
  billItem: BillItem
  setSaleItem: (saleItem: SaleItem | undefined) => void
  addBillItem: (billItem: BillItem) => void
  addLinkedProductModifierElement: (modifierElement: ModifierElement) => void
  removeLinkedProductModifierElement: (modifierElement: ModifierElement) => void
  setNewBillItem: () => void
  newCombinedLinkedProduct: (linkedProduct: LinkedProduct, billItemLinkedProductId: number) => void
}

const BillMakerProducts = ({ saleItem, setSaleItem, billItem, newCombinedLinkedProduct, setNewBillItem, addBillItem, addLinkedProductModifierElement, removeLinkedProductModifierElement }: Props) => {
  const [product, setProduct] = useState<Product>()
  const [incompleteProducts, setIncompleteProducts] = useState<number[]>([])
  const [validate, setValidate] = useState<boolean>(false)
  const [saleItemProductId, setSaleItemProductId] = useState<number>(0)

  const addNewBillItem = () => {
    if (validateBillItem()) {
      addBillItem(billItem)
      setNewBillItem()
      setSaleItem(undefined)
    }
  }

  const validateBillItem = (): boolean => {
    let isValid = true
    const tmpIncompleteProducts: number[] = incompleteProducts
    const tmpCompleteProducts: number[] = []
    for (const billItemLinkedProduct of billItem.billItemLinkedProducts) {
      for (const linkedProduct of billItemLinkedProduct.linkedProducts) {
        for (const productModifier of linkedProduct.linkedProductModifiers) {
          const elementsQuantity = productModifier.linkedProductModifierElements.length
          if (elementsQuantity < productModifier.minSelectable || elementsQuantity > productModifier.maxSelectable) {
            if (!incompleteProducts.includes(linkedProduct.productId)) {
              tmpIncompleteProducts.push(linkedProduct.productId)
              isValid = false
            }
          }
          else {
            tmpCompleteProducts.push(linkedProduct.productId)
          }
        }
      }
    }
    const tmpProducts = tmpIncompleteProducts.filter((productId) => !tmpCompleteProducts.includes(productId))
    setIncompleteProducts(tmpProducts)
    setValidate(true)
    return isValid
  }

  const addProduct = (product: Product, saleItemProductId: number) => {
    setProduct(product)
    setSaleItemProductId(saleItemProductId)
  }

  useEffect(() => {
    if (saleItem.saleItemProducts.length > 0) {
      setProduct(saleItem.saleItemProducts[0].product)
      setSaleItemProductId(saleItem.saleItemProducts[0].id)
    }
  }, [saleItem, billItem])

  return (
    <>
      {
        saleItem !== undefined &&
        saleItem.saleItemProducts.map((saleItemProduct, index) => {
          return (
            <div key={index} className="col-3 p-2 pointer" onClick={() => addProduct(saleItemProduct.product, saleItemProduct.id)}>
              <div className="card shadow" style={{ border: `${saleItemProduct.product?.id === product?.id ? '1px' : '0px'} solid rgba(255,193,7,.8)` }}>
                <div className="card-body">
                  <h5 className="card-title">{saleItemProduct.product.name}</h5>
                  <h6 className="card-subtitle mb-2 text-muted">{saleItemProduct.product.description}</h6>
                  <p className="card-text">{Number(saleItemProduct.product.price) === 0 ? '' :parseCurrency(saleItemProduct.product.price.toString())}</p>
                </div>
              </div>
              {
                incompleteProducts.includes(saleItemProduct.product.id) && validate &&
                <div className="col-12 d-flex justify-content-center">
                  <span className='text-danger'>Producto incompleto</span>
                </div>
              }
            </div>
          )
        })
      }
      {
        product &&
        <BillMakerModifierGroups saleItemProductId={saleItemProductId} newCombinedLinkedProduct={newCombinedLinkedProduct} billItem={billItem} removeLinkedProductModifierElement={removeLinkedProductModifierElement} addLinkedProductModifierElement={addLinkedProductModifierElement} product={product} />
      }

      <div className="col-8 position-absolute p-3 shadow bg-light" style={{ bottom: '0', left: '0' }}>
        <button className="btn btn-success col-12 py-4 fs-5" onClick={addNewBillItem}>Agregar</button>
      </div>
    </>
  )
}

export default BillMakerProducts