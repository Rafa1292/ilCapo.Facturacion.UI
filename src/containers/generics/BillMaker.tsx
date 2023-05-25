import React, { useContext, useEffect, useState } from 'react'
import '../../scss/billMaker.scss'
import { SaleItemCategory } from '../../types/saleItemCategory'
import { useGetList, useGet, usePost, usePatch } from '../../hooks/useAPI'
import { ProductModifier } from '../../types/productModifier'
import BillMakerItems from '../../components/billMaker/BillMakerItems'
import useBill from '../../hooks/useBill'
import BillResume from '../../components/BillResume'
import CustomInputSelect from '../../components/generics/CustomInputSelect'
import { BillItemLinkedProduct } from '../../types/billItemLinkedProduct'
import { BillItem } from '../../types/billItem'
import Swal from 'sweetalert2'
import AppContext from '../../context/AppContext'
import { BillFunctions } from '../../types/billFunctions'

interface Props {
  billFunctions: BillFunctions
}

interface SearchProduct {
  id: number
  categoryId: number
  saleItemId: number
  name: string
}

const initialSearchProduct: SearchProduct = {
  id: 0,
  categoryId: 0,
  saleItemId: 0,
  name: ''
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

const BillMaker = ({ billFunctions }: Props) => {
  const [saleItemCategories, setSaleItemCategories] = useState<SaleItemCategory[]>([])
  const [saleItemCategory, setSaleItemCategory] = useState<SaleItemCategory>()
  const [searchProducts, setSearchProducts] = useState<SearchProduct[]>([])
  const [editBillItem, setEditBillItem] = useState<BillItem>({ saleItemId: 0 } as BillItem)
  const { user } = useContext(AppContext)
  const { bill, addBillItem, printBill, removeLinkedProduct, editLinkedProduct, getClient, getBill, removeCombinedLinkedProduct } = billFunctions

  const handleChange = (event: any) => {
    const { value } = event.target
    const tmpSearchProduct = searchProducts.find(searchProduct => searchProduct.saleItemId === value)
    if (tmpSearchProduct) {
      const tmpSaleItemCategory = saleItemCategories.find(saleItemCategory => saleItemCategory.id === tmpSearchProduct.categoryId)
      if (tmpSaleItemCategory) {
        setSaleItemCategory(tmpSaleItemCategory)
        const tmpSaleItem = tmpSaleItemCategory.saleItems.find(saleItem => saleItem.id === tmpSearchProduct.saleItemId)
        if (tmpSaleItem) {
          setEditBillItem({ ...initialBillItem, saleItemId: tmpSaleItem.id })
        }
      }
    }
  }

  const setCategory = (saleItemCategory: SaleItemCategory) => {
    setEditBillItem({ saleItemId: 0 } as BillItem)
    setSaleItemCategory(saleItemCategory)
  }

  const initializeSearchProducts = (saleItemCategories: SaleItemCategory[]) => {
    const tmpSearchProducts: SearchProduct[] = []
    for (const saleItemCategory of saleItemCategories) {
      for (const saleItem of saleItemCategory.saleItems) {
        const tmpSearchProduct: SearchProduct = {
          id: 0,
          categoryId: saleItemCategory.id,
          saleItemId: saleItem.id,
          name: saleItem.name
        }
        tmpSearchProducts.push(tmpSearchProduct)
      }
    }
    setSearchProducts(tmpSearchProducts)
  }

  const handleEditLinkedProduct = (saleItemId: number, itemNumber: number) => {
    const tmpBillItem = editLinkedProduct(saleItemId, itemNumber)
    if (tmpBillItem) {
      for (const category of saleItemCategories) {
        const tmpSaleItem = category.saleItems.find(saleItem => saleItem.id === tmpBillItem.saleItemId)
        if (tmpSaleItem) {
          setSaleItemCategory(category)
          break
        }
      }
      setEditBillItem(tmpBillItem)
    }
  }

  const commandBill = async () => {
    bill.workDayUserId = user.workDayUser.id
    if (validateBill()) {
      if (bill.id === 0) {
        await newBill()
      }
      else {
        await updateBill()
      }
    }
  }

  const newBill = async () => {
    const response = await usePost('bills', bill, true)
    if (!response.error) {
      console.log('commandBill')
    }
  }

  const updateBill = async () => {
    console.log(bill)
    const response = await usePatch('bills', bill, true)
    if (!response.error) {
      console.log('updateBill')
    }
  }


  const validateBill = (): boolean => {
    let valid = false
    for (const billItem of bill.items) {
      for (const billItemLinkedProduct of billItem.billProducts) {
        for (const linkedProduct of billItemLinkedProduct.products) {
          if (!linkedProduct.isCommanded)
            valid = true
        }
      }
    }

    if (!valid) {
      Swal.fire('Error', 'No hay productos nuevos para comandar', 'error')
    } else {
      if (bill.clientId === 0) {
        valid = false
        Swal.fire('Error', 'Debe asignar un cliente', 'error')
      }
    }

    return valid
  }

  useEffect(() => {
    const getSaleItemCategories = async () => {
      const response = await useGetList<SaleItemCategory[]>('saleItemCategories', false)
      if (!response.error) {
        const tmpSaleItemCategories = response.data
        initializeSearchProducts(saleItemCategories)
        for (const saleItemCategory of tmpSaleItemCategories) {
          for (const saleItem of saleItemCategory.saleItems) {
            for (const saleItemProduct of saleItem.saleItemProducts) {
              const productModifiersResponse = await useGet<ProductModifier[]>(`productModifiers/byProductId/${saleItemProduct.productId}`, false)
              if (!productModifiersResponse.error) {
                const productModifiers = productModifiersResponse.data
                saleItemProduct.product.productModifiers = productModifiers
              }
            }
          }
        }
        setSaleItemCategories(tmpSaleItemCategories)
      }
    }
    getSaleItemCategories()
    getBill()
  }, [])


  return (
    <div className='col-12 d-flex flex-wrap'>
      <button className="btn btn-warning position-absolute" style={{ top: '0', right: '0vw', zIndex: '1000' }} onClick={() => printBill()}>Imprimer</button>
      <div className="col-8 bill-maker" >
        <div className="col-12 d-flex flex-wrap justify-content-end p-2">
          <div className="col-6">
            <CustomInputSelect showLabel={false} value={editBillItem?.saleItemId}
              customInputSelect={
                {
                  label: 'Productos', name: 'id',
                  handleChange: handleChange, pattern: '', validationMessage: ''
                }}
              data={searchProducts.map(searchProduct => { return { value: searchProduct.saleItemId, label: searchProduct.name } })}
              defaultLegend={'Productos'}
            />
          </div>
        </div>
        <div className="col-8 d-flex flex-wrap justify-content-around position-absolute bg-dark p-2 shadow"
          style={{ borderBottom: '1px solid rgba(255,193,7,0.8)', top: '0' }}>
          {
            saleItemCategories.map((tmpSaleItemCategory, index) => {
              return (
                <div key={index} onClick={() => setCategory(tmpSaleItemCategory)} className="px-3 py-1 rounded pointer item-category" >
                  <h6 className='m-0'>{tmpSaleItemCategory.name}</h6>
                </div>
              )
            })
          }
        </div>
        {
          saleItemCategory &&
          <BillMakerItems editBilItem={editBillItem ? editBillItem : { saleItemId: 0 } as BillItem} addBillItem={addBillItem} saleItemCategory={saleItemCategory} />
        }
      </div>
      <div className="col-4 shadow bill-resume position-relative" style={{ height: '100vh', zIndex: '100' }}>
        <BillResume removeCombinedLinkedProduct={removeCombinedLinkedProduct} getClient={getClient} commandBill={commandBill} handleEditLinkedProduct={handleEditLinkedProduct} removeLinkedProduct={removeLinkedProduct} bill={bill} />
      </div>
    </div>
    ||
    <></>
  )
}

export default BillMaker